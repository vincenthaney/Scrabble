import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AbstractPlayer } from '@app/classes/player';
import { ConvertDialogComponent } from '@app/components/convert-dialog/convert-dialog.component';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { DEFAULT_PLAYER } from '@app/constants/game';
import {
    DIALOG_BUTTON_CONTENT_REJECTED,
    DIALOG_CONTENT,
    DIALOG_TITLE,
    HOST_WAITING_MESSAGE,
    KEEP_DATA,
    OPPONENT_FOUND_MESSAGE,
} from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { PlayerLeavesService } from '@app/services/player-leaves-service/player-leaves.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-create-waiting-page',
    templateUrl: './create-waiting-page.component.html',
    styleUrls: ['./create-waiting-page.component.scss'],
})
export class CreateWaitingPageComponent implements OnInit, OnDestroy {
    @Input() opponentName: string | undefined = undefined;
    isStartingGame: boolean = false;
    isOpponentFound: boolean = false;
    host: AbstractPlayer = DEFAULT_PLAYER;
    waitingRoomMessage: string = HOST_WAITING_MESSAGE;
    componentDestroyed$: Subject<boolean> = new Subject();

    constructor(
        public dialog: MatDialog,
        public gameDispatcherService: GameDispatcherService,
        private readonly playerLeavesService: PlayerLeavesService,
        public router: Router,
    ) {}

    @HostListener('window:beforeunload')
    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
        if (!this.isStartingGame) this.gameDispatcherService.handleCancelGame();
    }

    ngOnInit(): void {
        this.gameDispatcherService.subscribeToJoinRequestEvent(this.componentDestroyed$, (opponentName: string) => this.setOpponent(opponentName));
        this.playerLeavesService.subscribeToJoinerLeavesGameEvent(this.componentDestroyed$, (leaverName: string) => this.opponentLeft(leaverName));
    }

    setOpponent(opponentName: string): void {
        this.opponentName = opponentName;
        this.waitingRoomMessage = this.opponentName + OPPONENT_FOUND_MESSAGE;
        this.isOpponentFound = true;
    }

    disconnectOpponent(): void {
        if (this.opponentName) {
            this.opponentName = undefined;
            this.waitingRoomMessage = HOST_WAITING_MESSAGE;
            this.isOpponentFound = false;
        }
    }

    opponentLeft(leaverName: string): void {
        this.disconnectOpponent();
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_TITLE,
                content: leaverName + DIALOG_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_REJECTED,
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    confirmConvertToSolo(): void {
        this.gameDispatcherService.handleCancelGame(KEEP_DATA);
        this.dialog.open(ConvertDialogComponent, {
            data: this.gameDispatcherService.currentLobby?.hostName,
        });
    }

    confirmOpponentToServer(): void {
        this.isStartingGame = true;
        if (this.opponentName) {
            this.gameDispatcherService.handleConfirmation(this.opponentName);
        }
    }

    confirmRejectionToServer(): void {
        if (this.opponentName) {
            this.gameDispatcherService.handleRejection(this.opponentName);
            this.disconnectOpponent();
        }
    }
}
