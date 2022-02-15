import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AbstractPlayer } from '@app/classes/player';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import {
    DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
    DIALOG_CONTENT,
    DIALOG_TITLE,
    HOST_WAITING_MESSAGE,
    OPPONENT_FOUND_MESSAGE,
} from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { PlayerLeavesService } from '@app/services/player-leaves/player-leaves.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-create-waiting-page',
    templateUrl: './create-waiting-page.component.html',
    styleUrls: ['./create-waiting-page.component.scss'],
})
export class CreateWaitingPageComponent implements OnInit, OnDestroy {
    @Input() opponentName: string | undefined;
    isStartingGame: boolean = false;
    joinRequestSubscription: Subscription;
    joinerLeaveGameSubscription: Subscription;
    componentDestroyed$: Subject<boolean> = new Subject();
    host: AbstractPlayer;
    waitingRoomMessage: string = HOST_WAITING_MESSAGE;
    isOpponentFound: boolean;
    constructor(
        public dialog: MatDialog,
        public gameDispatcherService: GameDispatcherService,
        private readonly playerLeavesService: PlayerLeavesService,
        public router: Router,
    ) {}

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
        if (!this.isStartingGame) this.gameDispatcherService.handleCancelGame();
    }

    ngOnInit() {
        this.joinRequestSubscription = this.gameDispatcherService.joinRequestEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((opponentName: string) => this.setOpponent(opponentName));
        this.joinerLeaveGameSubscription = this.playerLeavesService.joinerLeaveGameEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((leaverName: string) => this.opponentLeft(leaverName));
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

    opponentLeft(leaverName: string) {
        this.opponentName = undefined;
        this.waitingRoomMessage = HOST_WAITING_MESSAGE;
        this.isOpponentFound = false;

        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_TITLE,
                content: leaverName + DIALOG_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    confirmOpponentToServer() {
        this.isStartingGame = true;
        if (this.opponentName) {
            this.gameDispatcherService.handleConfirmation(this.opponentName);
        }
    }

    confirmRejectionToServer() {
        if (this.opponentName) {
            this.gameDispatcherService.handleRejection(this.opponentName);
            this.disconnectOpponent();
        }
    }
}
