import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractPlayer } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { GameService } from '@app/services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss'],
})
export class TileRackComponent implements OnInit, OnDestroy {
    tiles: Tile[];
    updateTileRackSubscription: Subscription;

    constructor(public gameService: GameService) {}

    ngOnInit() {
        this.updateTileRack();
        if (!this.gameService.updateTileRackEvent) return;
        this.updateTileRackSubscription = this.gameService.updateTileRackEvent.subscribe(() => this.updateTileRack());
    }

    ngOnDestroy() {
        if (!this.updateTileRackSubscription) return;
        this.updateTileRackSubscription.unsubscribe();
    }

    private updateTileRack() {
        this.tiles = [];
        const localPlayer: AbstractPlayer | undefined = this.gameService.getLocalPlayer();
        if (!localPlayer || !localPlayer.getTiles()) {
            return;
        }
        localPlayer.getTiles().forEach((tile: Tile) => {
            this.tiles.push({ letter: tile.letter, value: tile.value });
        });
    }
}
