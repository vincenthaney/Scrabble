import { Component, OnDestroy } from '@angular/core';
import { IPlayer } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { GameService } from '@app/services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss'],
})
export class TileRackComponent implements OnDestroy {
    tiles: Tile[];
    startGameSubscription: Subscription;

    constructor(public gameService: GameService) {
        if (this.gameService.startGameEvent) {
            this.startGameSubscription = this.gameService.startGameEvent.subscribe(() => this.initializeTileRack());
        }
    }

    ngOnDestroy() {
        if (this.startGameSubscription) {
            this.startGameSubscription.unsubscribe();
        }
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
