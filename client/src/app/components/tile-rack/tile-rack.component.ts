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
        if (!this.gameService.getLocalPlayer() || !this.gameService.getLocalPlayer().getTiles()) {
            return;
        }

        this.gameService
            .getLocalPlayer()
            .getTiles()
            .forEach((tile: Tile) => {
                this.tiles.push({ letter: tile.letter, value: tile.value });
            });
    }
}
