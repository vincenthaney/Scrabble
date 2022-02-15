import { Component, OnInit, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FontSizeChangeOperations } from '@app/classes/font-size-operations';
import { BoardComponent } from '@app/components/board/board.component';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import {
    DIALOG_ABANDON_TITLE,
    DIALOG_ABANDON_CONTENT,
    DIALOG_ABANDON_BUTTON_CONFIRM,
    DIALOG_ABANDON_BUTTON_CONTINUE,
    DIALOG_NO_ACTIVE_GAME_TITLE,
    DIALOG_NO_ACTIVE_GAME_CONTENT,
    DIALOG_NO_ACTIVE_GAME_BUTTON,
} from '@app/constants/pages-constants';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import {
    RACK_FONT_SIZE_INCREMENT,
    RACK_TILE_MAX_FONT_SIZE,
    RACK_TILE_MIN_FONT_SIZE,
    SQUARE_FONT_SIZE_INCREMENT,
    SQUARE_TILE_MAX_FONT_SIZE,
    SQUARE_TILE_MIN_FONT_SIZE,
} from '@app/constants/tile-font-size';
import { GameService } from '@app/services';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

    constructor(public dialog: MatDialog, public gameService: GameService, private focusableComponentService: FocusableComponentsService) {}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.focusableComponentService.emitKeyboard(event);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        console.log('destruction gamepage');
        if (this.gameService.getGameId()) {
            this.gameService.disconnectGame();
        }
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    ngOnInit(): void {
        console.log('init gamepage');

        this.noActiveGameSubscription = this.gameService.noActiveGameEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe(() => this.noActiveGameDialog());
        if (!this.gameService.getGameId()) {
            this.gameService.reconnectGame();
        }
    }

    abandonDialog() {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_ABANDON_TITLE,
                content: DIALOG_ABANDON_CONTENT,
                buttons: [
                    {
                        content: DIALOG_ABANDON_BUTTON_CONFIRM,
                        redirect: '/home',
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                    },
                    {
                        content: DIALOG_ABANDON_BUTTON_CONTINUE,
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }
    noActiveGameDialog() {
        console.log('noActiveGameDialog');
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
    changeTileFontSize(operation: FontSizeChangeOperations) {
        if (operation === 'smaller') {
            if (this.tileRackComponent.tileFontSize > RACK_TILE_MIN_FONT_SIZE) this.tileRackComponent.tileFontSize -= RACK_FONT_SIZE_INCREMENT;
            if (this.boardComponent.tileFontSize > SQUARE_TILE_MIN_FONT_SIZE) this.boardComponent.tileFontSize -= SQUARE_FONT_SIZE_INCREMENT;
        } else {
            if (this.tileRackComponent.tileFontSize < RACK_TILE_MAX_FONT_SIZE) this.tileRackComponent.tileFontSize += RACK_FONT_SIZE_INCREMENT;
            if (this.boardComponent.tileFontSize < SQUARE_TILE_MAX_FONT_SIZE) this.boardComponent.tileFontSize += SQUARE_FONT_SIZE_INCREMENT;
        }
    }
}
