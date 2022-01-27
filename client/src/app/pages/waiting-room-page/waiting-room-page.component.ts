import { Component, Input } from '@angular/core';
import { OnlinePlayer } from '@app/classes/player';
import { WaitingRoomMessages } from './waiting-room-page.component.const';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    @Input() opponent: OnlinePlayer | undefined;
    host: OnlinePlayer;
    messageWaitingRoom: string = WaitingRoomMessages.HostWaitingMessage;
    isOpponentFound: boolean;
    constructor(public dialog: MatDialog) {}

    setHost(host: OnlinePlayer) {
        this.host = host;
    }

    setOpponent(opponent: OnlinePlayer) {
        this.opponent = opponent;
        this.messageWaitingRoom = this.opponent.name + WaitingRoomMessages.OpponentFoundMessage;
        this.isOpponentFound = true;
    }

    disconnectOpponent() {
        this.opponent = undefined;
        this.messageWaitingRoom = WaitingRoomMessages.HostWaitingMessage;
        this.isOpponentFound = false;
        this.warnHostOpponentLeft();
    }

    warnHostOpponentLeft() {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                // Data type is DefaultDialogParameters
                title: 'Attention!',
                content: "Votre adversaire a quitté le salon. S'il-vous-plaît, patientez le temps qu'un autre joueur veuille vous affronter.",
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
