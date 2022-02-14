import { Component, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BoardComponent } from '@app/components/board/board.component';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import {
    RACK_FONT_SIZE_INCREMENT,
    RACK_TILE_MAX_FONT_SIZE,
    RACK_TILE_MIN_FONT_SIZE,
    SQUARE_FONT_SIZE_INCREMENT,
    SQUARE_TILE_MAX_FONT_SIZE,
    SQUARE_TILE_MIN_FONT_SIZE
} from '@app/constants/tile-font-size';
import { GameService } from '@app/services';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    @ViewChild(BoardComponent, { static: false }) boardComponent: BoardComponent;
    @ViewChild(TileRackComponent, { static: false }) tileRackComponent: TileRackComponent;

    constructor(public surrenderDialog: MatDialog, public gameService: GameService, private focusableComponentService: FocusableComponentsService) {}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.focusableComponentService.emitKeyboard(event);
    }

    openDialog() {
        this.surrenderDialog.open(DefaultDialogComponent, {
            data: {
                title: 'Abandonner la partie',
                content: 'Voulez-vous vraiment ABANDONNER?',
                buttons: [
                    {
                        content: 'Abandonner la partie',
                        redirect: '/home',
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                    },
                    {
                        content: 'Continuer la partie',
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }

    changeTileFontSize(operation: string) {
        if (operation === 'smaller') {
            if (this.tileRackComponent.tileFontSize > RACK_TILE_MIN_FONT_SIZE) this.tileRackComponent.tileFontSize -= RACK_FONT_SIZE_INCREMENT;
            if (this.boardComponent.tileFontSize > SQUARE_TILE_MIN_FONT_SIZE) this.boardComponent.tileFontSize -= SQUARE_FONT_SIZE_INCREMENT;
        } else if (operation === 'larger') {
            if (this.tileRackComponent.tileFontSize < RACK_TILE_MAX_FONT_SIZE) this.tileRackComponent.tileFontSize += RACK_FONT_SIZE_INCREMENT;
            if (this.boardComponent.tileFontSize < SQUARE_TILE_MAX_FONT_SIZE) this.boardComponent.tileFontSize += SQUARE_FONT_SIZE_INCREMENT;
        }
    }
}
