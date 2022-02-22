import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FontSizeChangeOperations } from '@app/classes/font-size-operations';
import { BoardComponent } from '@app/components/board/board.component';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import {
    DIALOG_ABANDON_BUTTON_CONFIRM,
    DIALOG_ABANDON_BUTTON_CONTINUE,
    DIALOG_ABANDON_CONTENT,
    DIALOG_ABANDON_TITLE,
    DIALOG_NO_ACTIVE_GAME_BUTTON,
    DIALOG_NO_ACTIVE_GAME_CONTENT,
    DIALOG_NO_ACTIVE_GAME_TITLE,
    DIALOG_QUIT_BUTTON_CONFIRM,
    DIALOG_QUIT_CONTENT,
    DIALOG_QUIT_STAY,
    DIALOG_QUIT_TITLE,
} from '@app/constants/pages-constants';
import {
    RACK_FONT_SIZE_INCREMENT,
    RACK_TILE_MAX_FONT_SIZE,
    RACK_TILE_MIN_FONT_SIZE,
    SQUARE_FONT_SIZE_INCREMENT,
    SQUARE_TILE_MAX_FONT_SIZE,
    SQUARE_TILE_MIN_FONT_SIZE,
} from '@app/constants/tile-font-size';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GameService } from '@app/services';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
import { PlayerLeavesService } from '@app/services/player-leaves/player-leaves.service';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild(BoardComponent, { static: false }) boardComponent: BoardComponent;
    @ViewChild(TileRackComponent, { static: false }) tileRackComponent: TileRackComponent;
    noActiveGameSubscription: Subscription;
    componentDestroyed$: Subject<boolean> = new Subject();

    constructor(
        public dialog: MatDialog,
        public gameService: GameService,
        private focusableComponentService: FocusableComponentsService,
        private gameDispatcher: GameDispatcherController,
        public surrenderDialog: MatDialog,
        private playerLeavesService: PlayerLeavesService,
        private gameViewEventManagerService: GameViewEventManagerService,
    ) {}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        this.focusableComponentService.emitKeyboard(event);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy(): void {
        if (this.gameService.getGameId()) {
            this.gameService.disconnectGame();
        }
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    ngOnInit(): void {
        this.gameDispatcher.configureSocket();

        this.noActiveGameSubscription = this.gameViewEventManagerService.subscribeToGameViewEvent('noActiveGame', this.componentDestroyed$, () =>
            this.noActiveGameDialog(),
        );
        if (!this.gameService.getGameId()) {
            this.gameService.reconnectGame();
        }
    }

    openDialog(title: string, content: string, buttonsContent: string[]): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title,
                content,
                buttons: [
                    {
                        content: buttonsContent[0],
                        redirect: '/home',
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                        // We haven't been able to test that the right function is called because this
                        // arrow function creates a new instance of the function. We cannot spy on it.
                        // It totally works tho, try it!
                        action: () => this.handlePlayerLeave(),
                    },
                    {
                        content: buttonsContent[1],
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }

    quitButtonClicked(): void {
        let title = '';
        let content = '';
        const buttonsContent = ['', ''];
        if (this.gameService.isGameOver) {
            title = DIALOG_QUIT_TITLE;
            content = DIALOG_QUIT_CONTENT;
            buttonsContent[0] = DIALOG_QUIT_BUTTON_CONFIRM;
            buttonsContent[1] = DIALOG_QUIT_STAY;
        } else {
            title = DIALOG_ABANDON_TITLE;
            content = DIALOG_ABANDON_CONTENT;
            buttonsContent[0] = DIALOG_ABANDON_BUTTON_CONFIRM;
            buttonsContent[1] = DIALOG_ABANDON_BUTTON_CONTINUE;
        }
        this.openDialog(title, content, buttonsContent);
    }

    noActiveGameDialog(): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_NO_ACTIVE_GAME_TITLE,
                content: DIALOG_NO_ACTIVE_GAME_CONTENT,
                buttons: [
                    {
                        content: DIALOG_NO_ACTIVE_GAME_BUTTON,
                        closeDialog: false,
                        redirect: '/home',
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }

    changeTileFontSize(operation: FontSizeChangeOperations): void {
        if (operation === 'smaller') {
            if (this.tileRackComponent.tileFontSize > RACK_TILE_MIN_FONT_SIZE) this.tileRackComponent.tileFontSize -= RACK_FONT_SIZE_INCREMENT;
            if (this.boardComponent.tileFontSize > SQUARE_TILE_MIN_FONT_SIZE) this.boardComponent.tileFontSize -= SQUARE_FONT_SIZE_INCREMENT;
        } else {
            if (this.tileRackComponent.tileFontSize < RACK_TILE_MAX_FONT_SIZE) this.tileRackComponent.tileFontSize += RACK_FONT_SIZE_INCREMENT;
            if (this.boardComponent.tileFontSize < SQUARE_TILE_MAX_FONT_SIZE) this.boardComponent.tileFontSize += SQUARE_FONT_SIZE_INCREMENT;
        }
    }

    private handlePlayerLeave(): void {
        this.gameService.gameId = '';
        this.playerLeavesService.handleLocalPlayerLeavesGame();
    }
}
