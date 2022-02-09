import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationStart } from '@angular/router';
import { OnlinePlayer } from '@app/classes/player';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { Subscription } from 'rxjs';
import {
    DIALOG_BUTTON_CONTENT,
    DIALOG_CONTENT,
    DIALOG_TITLE,
    HOST_WAITING_MESSAGE,
    OPPONENT_FOUND_MESSAGE,
} from './create-waiting-page.component.const';

@Component({
    selector: 'app-create-waiting-page',
    templateUrl: './create-waiting-page.component.html',
    styleUrls: ['./create-waiting-page.component.scss'],
})
export class CreateWaitingPageComponent implements OnInit, OnDestroy {
    @Input() opponent: string | undefined;
    joinRequestSubscription: Subscription;
    joinerLeaveGameSubscription: Subscription;
    routingSubscription: Subscription;

    host: OnlinePlayer;
    waitingRoomMessage: string = HOST_WAITING_MESSAGE;
    isOpponentFound: boolean;
    constructor(public dialog: MatDialog, public gameDispatcherService: GameDispatcherService, public router: Router) {}

    ngOnInit() {
        this.routingSubscription = this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.routerChangeMethod(event.url);
            }
        });
        this.joinRequestSubscription = this.gameDispatcherService.joinRequestEvent.subscribe((opponentName) => this.setOpponent(opponentName));
        this.joinerLeaveGameSubscription = this.gameDispatcherService.joinerLeaveGameEvent.subscribe((leaverName) => this.opponentLeft(leaverName));
    }

    routerChangeMethod(url: string) {
        if (url !== '/game') this.gameDispatcherService.handleCancelGame();
    }

    ngOnDestroy() {
        if (this.joinRequestSubscription) {
            this.joinRequestSubscription.unsubscribe();
        }
        if (this.joinerLeaveGameSubscription) {
            this.joinerLeaveGameSubscription.unsubscribe();
        }
        if (this.routingSubscription) {
            this.routingSubscription.unsubscribe();
        }
    }

    setOpponent(opponent: string) {
        this.opponent = opponent;
        this.waitingRoomMessage = this.opponent + OPPONENT_FOUND_MESSAGE;
        this.isOpponentFound = true;
    }

    disconnectOpponent() {
        if (this.opponent) {
            this.opponent = undefined;
            this.waitingRoomMessage = HOST_WAITING_MESSAGE;
            this.isOpponentFound = false;
        }
    }

    opponentLeft(leaverName: string) {
        this.opponent = undefined;
        this.waitingRoomMessage = HOST_WAITING_MESSAGE;
        this.isOpponentFound = false;

        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_TITLE,
                content: leaverName + DIALOG_CONTENT,
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
        if (this.opponent) {
            this.gameDispatcherService.handleConfirmation(this.opponent);
        }
    }

    confirmRejectionToServer() {
        if (this.opponent) {
            this.gameDispatcherService.handleRejection(this.opponent);
            this.disconnectOpponent();
        }
    }
}
