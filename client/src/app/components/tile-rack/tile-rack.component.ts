import { Component, OnInit } from '@angular/core';
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
        this.initializeTileRack();
    }

    private initializeTileRack() {
        this.tiles = [];
        // eslint-disable-next-line dot-notation
        this.gameService['localPlayer'] = {
            name: 'test',
            score: 0,
            tiles: [
                { letter: 'A', value: 1 },
                { letter: 'B', value: 2 },
                { letter: 'C', value: 3 },
                { letter: 'D', value: 4 },
            ],
        };
        if (!this.gameService.getLocalPlayer() || !this.gameService.getLocalPlayer().tiles) {
            return;
        }

        this.gameService.getLocalPlayer().tiles.forEach((tile: Tile) => {
            this.tiles.push({ letter: tile.letter, value: tile.value });
        });
    }
}
