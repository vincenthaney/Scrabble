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
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { Router, NavigationStart } from '@angular/router';
@Component({
    selector: 'app-waiting-page',
    templateUrl: './join-waiting-page.component.html',
    styleUrls: ['./join-waiting-page.component.scss'],
})
export class JoinWaitingPageComponent implements OnInit, OnDestroy {
    canceledGameSubscription: Subscription;
    joinerRejectedSubscription: Subscription;
    routingSubscription: Subscription;

    state: GameRequestState = GameRequestState.Waiting;
    waitingGameName: string = 'testName';
    waitingGameType: string = 'testType';
    waitingGameTimer: string = 'timer';
    waitingGameDictionary: string = 'dictionary';
    waitingPlayerName: string = 'waitingPlayer';
    waitingOpponentName: string = 'hostPlayer';

    constructor(public dialog: MatDialog, public gameDispatcherService: GameDispatcherService, public router: Router) {}

    ngOnInit() {
        this.routingSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.routerChangeMethod(event.url);
            }
        });

        if (!this.canceledGameSubscription) {
            this.canceledGameSubscription = this.gameDispatcherService.canceledGameEvent
                .pipe(take(1))
                .subscribe((hostName: string) => this.hostHasCanceled(hostName));
        }
        if (!this.joinerRejectedSubscription) {
            this.joinerRejectedSubscription = this.gameDispatcherService.joinerRejectedEvent
                .pipe(take(1))
                .subscribe((hostName: string) => this.playerRejected(hostName));
        }
    }
    ngOnDestroy() {
        if (this.canceledGameSubscription) {
            this.canceledGameSubscription.unsubscribe();
        }
        if (this.joinerRejectedSubscription) {
            this.joinerRejectedSubscription.unsubscribe();
        }
        if (this.routingSubscription) {
            this.routingSubscription.unsubscribe();
        }
    }
    routerChangeMethod(url: string) {
        if (url !== '/game') this.gameDispatcherService.handleLeaveLobby();
    }

    playerRejected(hostName: string) {
        this.dialog.open(DefaultDialogComponent, {
            data: {
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
}
