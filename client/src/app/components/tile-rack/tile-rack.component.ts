import { Component, OnInit } from '@angular/core';
import { GRID_MARGIN_LETTER } from '@app/classes/game-constants';
import { Tile } from '@app/classes/tile';
import { GameService } from '@app/services';

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss'],
})
export class TileRackComponent implements OnInit {
    tiles: Tile[];

    constructor(private gameService: GameService) {}
    ngOnInit() {
        this.tiles = [];
        for (let i = 0; i < this.gameService.getInitPlayerTileAmount(); i++) {
            const letter = GRID_MARGIN_LETTER[Math.floor(Math.random() * GRID_MARGIN_LETTER.length)];
            const value = Math.floor(Math.random() * 10);
            this.tiles.push({ letter, value });
        }
    }
}
