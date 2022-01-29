import { Component, Input } from '@angular/core';
import { OnlinePlayer } from '@app/classes/player';
import { WaitingRoomMessages } from './create-waiting-page.component.const';
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
    waitingRoomMessage: string = WaitingRoomMessages.HostWaitingMessage;
    isOpponentFound: boolean;
    constructor(public dialog: MatDialog) {}

    setOpponent(opponent: OnlinePlayer) {
        this.opponent = opponent;
        this.waitingRoomMessage = this.opponent.name + WaitingRoomMessages.OpponentFoundMessage;
        this.isOpponentFound = true;
    }

    disconnectOpponent(opponentName: string) {
        this.warnHostOpponentLeft(opponentName);
        this.opponent = undefined;
        this.waitingRoomMessage = WaitingRoomMessages.HostWaitingMessage;
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
