import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractPlayer } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { RACK_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size';
import { GameService } from '@app/services';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss'],
})
export class TileRackComponent implements OnInit, OnDestroy {
    tiles: Tile[];
    tileFontSize: number = RACK_TILE_DEFAULT_FONT_SIZE;
    updateTileRackSubscription: Subscription;
    serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(public gameService: GameService) {}

    ngOnInit() {
        this.updateTileRack();
        this.updateTileRackSubscription = this.gameService.updateTileRackEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe(() => this.updateTileRack());
    }

    ngOnDestroy() {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
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
