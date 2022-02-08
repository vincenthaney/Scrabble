/* eslint-disable no-console */
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    DIALOG_BUTTON_CONTENT,
    DIALOG_CANCEL_CONTENT,
    DIALOG_CANCEL_TITLE,
    DIALOG_REJECT_CONTENT,
    DIALOG_REJECT_TITLE,
    GameRequestState,
} from './join-waiting-page.component.const';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
@Component({
    selector: 'app-waiting-page',
    templateUrl: './join-waiting-page.component.html',
    styleUrls: ['./join-waiting-page.component.scss'],
})
export class JoinWaitingPageComponent implements OnInit, OnDestroy {
    canceledGameSubscription: Subscription;
    joinerRejectedSubscription: Subscription;

    state: GameRequestState = GameRequestState.Waiting;
    waitingGameName: string = 'testName';
    waitingGameType: string = 'testType';
    waitingGameTimer: string = 'timer';
    waitingGameDictionary: string = 'dictionary';
    waitingPlayerName: string = 'waitingPlayer';

    constructor(public dialog: MatDialog, public gameDispatcherService: GameDispatcherService) {}

    ngOnInit() {
        console.log('NGONINIT');
        if (!this.canceledGameSubscription) {
            this.canceledGameSubscription = this.gameDispatcherService.canceledGameEvent
                .pipe(take(1))
                .subscribe((hostName) => this.hostHasCanceled(hostName));
        }
        if (!this.joinerRejectedSubscription) {
            console.log('joinerRejectedSubscription');

            this.joinerRejectedSubscription = this.gameDispatcherService.joinerRejectedEvent
                .pipe(take(1))
                .subscribe((hostName) => this.playerHasBeenRejected(hostName));
        }
    }

    ngOnDestroy() {
        if (this.canceledGameSubscription) {
            this.canceledGameSubscription.unsubscribe();
        }
    }

    playerHasBeenRejected(hostName: string) {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                // Data type is DefaultDialogParameters
                title: DIALOG_REJECT_TITLE,
                content: hostName + DIALOG_REJECT_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT,
                        redirect: '/lobby',
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    hostHasCanceled(hostName: string) {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                // Data type is DefaultDialogParameters
                title: DIALOG_CANCEL_TITLE,
                content: hostName + DIALOG_CANCEL_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT,
                        redirect: '/lobby',
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    joiningPlayerLeave() {
        this.gameDispatcherService.handleLeaveLobby();
    }
}
