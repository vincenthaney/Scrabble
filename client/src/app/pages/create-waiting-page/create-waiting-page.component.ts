import { Component, Input } from '@angular/core';
import { OnlinePlayer } from '@app/classes/player';
import { HOST_WAITING_MESSAGE, OPPONENT_FOUND_MESSAGE } from './create-waiting-page.component.const';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-create-waiting-page',
    templateUrl: './create-waiting-page.component.html',
    styleUrls: ['./create-waiting-page.component.scss'],
})
export class CreateWaitingPageComponent {
    @Input() opponent: OnlinePlayer | undefined;
    host: OnlinePlayer;
    waitingRoomMessage: string = HOST_WAITING_MESSAGE;
    isOpponentFound: boolean;
    constructor(public dialog: MatDialog) {}

    setOpponent(opponent: OnlinePlayer) {
        this.opponent = opponent;
        this.waitingRoomMessage = this.opponent.name + OPPONENT_FOUND_MESSAGE;
        this.isOpponentFound = true;
    }

    disconnectOpponent(opponentName: string) {
        this.warnHostOpponentLeft(opponentName);
        this.opponent = undefined;
        this.waitingRoomMessage = HOST_WAITING_MESSAGE;
        this.isOpponentFound = false;
    }

    warnHostOpponentLeft(opponentName: string) {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                // Data type is DefaultDialogParameters
                title: 'Attention!',
                content: opponentName + "a rejoint le salon. Veuillez patientez le temps qu'un autre joueur veuille vous affronter.",
                buttons: [
                    {
                        content: 'Retourner en attente.',
                        closeDialog: true,
                    },
                ],
            },
        });
    }
}
