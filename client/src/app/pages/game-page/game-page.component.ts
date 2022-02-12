import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BoardComponent } from '@app/components/board/board.component';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { TILE_MAX_FONT_SIZE, TILE_MIN_FONT_SIZE } from '@app/constants/game';
import { GameService } from '@app/services';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    @ViewChild(BoardComponent, { static: false }) boardComponent: BoardComponent;
    @ViewChild(TileRackComponent, { static: false }) tileRackComponent: TileRackComponent;

    constructor(public surrenderDialog: MatDialog, public gameService: GameService) {}

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

    changeFontSize(operation: string) {
        console.log(operation);
        this.boardComponent.changeFontSize(operation);
        if (operation === 'smaller') {
            // this.boardComponent.gridSize.x = 10;
            // this.tileRackComponent.tiles.forEach((tile) => (tile.letter = 'A'));
            if (this.tileRackComponent.fontSize > TILE_MIN_FONT_SIZE) this.tileRackComponent.fontSize -= 0.1;
        } else if (operation === 'larger') {
            if (this.tileRackComponent.fontSize < TILE_MAX_FONT_SIZE) this.tileRackComponent.fontSize += 0.1;
        }
    }
}
