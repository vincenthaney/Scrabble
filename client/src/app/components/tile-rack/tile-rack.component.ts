import { Component } from '@angular/core';
import { IPlayer } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { GameService } from '@app/services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss'],
})
export class TileRackComponent {
    tiles: Tile[];
    startGameSubscription: Subscription;

    constructor(private gameService: GameService) {
        this.startGameSubscription = this.gameService.startGameEvent.subscribe(() => this.initializeTileRack());
    }

    private initializeTileRack() {
        this.tiles = [];
        const localPlayer: IPlayer | undefined = this.gameService.getLocalPlayer();
        if (!localPlayer || !localPlayer.getTiles()) {
            return;
        }
        localPlayer.getTiles().forEach((tile: Tile) => {
            this.tiles.push({ letter: tile.letter, value: tile.value });
        });
    }
}
