import { Component, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { OnlinePlayer } from '@app/classes/player';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import {
    DIALOG_BUTTON_CONTENT,
    DIALOG_CONTENT,
    DIALOG_TITLE,
    HOST_WAITING_MESSAGE,
    OPPONENT_FOUND_MESSAGE
} from './create-waiting-page.component.const';

@Component({
    selector: 'app-create-waiting-page',
    templateUrl: './create-waiting-page.component.html',
    styleUrls: ['./create-waiting-page.component.scss'],
})
export class CreateWaitingPageComponent {
    @Input() opponent: OnlinePlayer | undefined;
    @ViewChild(MatProgressSpinner, { static: false }) spinnerOpponentFound: MatProgressSpinner;

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
                title: DIALOG_TITLE,
                content: opponentName + DIALOG_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT,
                        closeDialog: true,
                    },
                ],
            },
        });
    }
}
