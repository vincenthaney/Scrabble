import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { OnlinePlayer } from '@app/classes/player';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { Subscription } from 'rxjs';
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
export class CreateWaitingPageComponent implements OnInit, OnDestroy {
    @Input() opponentName: string | undefined;
    @ViewChild(MatProgressSpinner, { static: false }) spinnerOpponentFound: MatProgressSpinner;
    joinRequestSubscription: Subscription;
    joinerLeaveGameSubscription: Subscription;

    host: OnlinePlayer;
    waitingRoomMessage: string = HOST_WAITING_MESSAGE;
    isOpponentFound: boolean;
    constructor(public dialog: MatDialog, public gameDispatcherService: GameDispatcherService) {}

    ngOnInit() {
        this.joinRequestSubscription = this.gameDispatcherService.joinRequestEvent.subscribe((opponentName) => this.setOpponent(opponentName));
        this.joinerLeaveGameSubscription = this.gameDispatcherService.joinerLeaveGameEvent.subscribe((leaverName) => this.rejectOpponent(leaverName));
    }

    ngOnDestroy() {
        if (this.joinRequestSubscription) {
            this.joinRequestSubscription.unsubscribe();
        }
        if (this.joinerLeaveGameSubscription) {
            this.joinerLeaveGameSubscription.unsubscribe();
        }
    }

    setOpponent(opponentName: string) {
        this.opponentName = opponentName;
        this.waitingRoomMessage = this.opponentName + OPPONENT_FOUND_MESSAGE;
        this.isOpponentFound = true;
    }

    disconnectOpponent() {
        if (this.opponentName) {
            this.opponentName = undefined;
            this.waitingRoomMessage = HOST_WAITING_MESSAGE;
            this.isOpponentFound = false;
        }
    }

    rejectOpponent(leaverName: string) {
        // eslint-disable-next-line no-console
        console.log('rejectOpponent-CLIENT');
        this.warnHostOpponentLeft(leaverName);
        this.opponentName = undefined;
        this.waitingRoomMessage = HOST_WAITING_MESSAGE;
        this.isOpponentFound = false;
    }

    cancelGame() {
        // eslint-disable-next-line no-console
        console.log('CANCELGAME-CLIENT');
        this.gameDispatcherService.handleCancelGame();
        // if (this.opponent) {
        //     this.warnHostOpponentLeft(this.opponent);
        //     this.opponent = undefined;
        //     this.waitingRoomMessage = HOST_WAITING_MESSAGE;
        //     this.isOpponentFound = false;
        // }
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

    confirmOpponentToServer() {
        // eslint-disable-next-line no-console
        console.log(this.opponentName);
        if (this.opponentName) {
            this.gameDispatcherService.handleConfirmation(this.opponentName);
        }
    }

    confirmRejectionToServer() {
        if (this.opponentName) {
            this.gameDispatcherService.handleRejection(this.opponentName);
        }
        this.disconnectOpponent();
    }
}
