import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AbstractPlayer } from '@app/classes/player';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { GameDispatcherService } from '@app/services/';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createWaitingPageConstants } from '@app/constants/pages-constants';

@Component({
    selector: 'app-create-waiting-page',
    templateUrl: './create-waiting-page.component.html',
    styleUrls: ['./create-waiting-page.component.scss'],
})
export class CreateWaitingPageComponent implements OnInit, OnDestroy {
    @Input() opponent: string | undefined;
    isStartingGame: boolean = false;
    joinRequestSubscription: Subscription;
    joinerLeaveGameSubscription: Subscription;
    componentDestroyed$: Subject<boolean> = new Subject();
    host: AbstractPlayer;
    waitingRoomMessage: string = createWaitingPageConstants.HOST_WAITING_MESSAGE;
    isOpponentFound: boolean;
    constructor(public dialog: MatDialog, public gameDispatcherService: GameDispatcherService, public router: Router) {}

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
        if (!this.isStartingGame) this.gameDispatcherService.handleCancelGame();
    }

    ngOnInit() {
        this.joinRequestSubscription = this.gameDispatcherService.joinRequestEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((opponentName) => this.setOpponent(opponentName));
        this.joinerLeaveGameSubscription = this.gameDispatcherService.joinerLeaveGameEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((leaverName) => this.opponentLeft(leaverName));
    }

    setOpponent(opponent: string) {
        this.opponent = opponent;
        this.waitingRoomMessage = this.opponent + createWaitingPageConstants.OPPONENT_FOUND_MESSAGE;
        this.isOpponentFound = true;
    }

    disconnectOpponent() {
        if (this.opponent) {
            this.opponent = undefined;
            this.waitingRoomMessage = createWaitingPageConstants.HOST_WAITING_MESSAGE;
            this.isOpponentFound = false;
        }
    }

    opponentLeft(leaverName: string) {
        this.opponent = undefined;
        this.waitingRoomMessage = createWaitingPageConstants.HOST_WAITING_MESSAGE;
        this.isOpponentFound = false;

        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: createWaitingPageConstants.DIALOG_TITLE,
                content: leaverName + createWaitingPageConstants.DIALOG_CONTENT,
                buttons: [
                    {
                        content: createWaitingPageConstants.DIALOG_BUTTON_CONTENT,
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    confirmOpponentToServer() {
        this.isStartingGame = true;
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
