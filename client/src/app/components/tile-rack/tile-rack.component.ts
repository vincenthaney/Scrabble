import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';
import { AbstractPlayer } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { RACK_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size';
import { GameService } from '@app/services';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type RackTile = Tile & { played?: boolean };

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss'],
})
export class TileRackComponent implements OnInit, OnDestroy {
    tiles: RackTile[];
    tileFontSize: number = RACK_TILE_DEFAULT_FONT_SIZE;
    updateTileRackSubscription: Subscription;
    serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(public gameService: GameService) {}

    ngOnInit(): void {
        this.updateTileRack();
        this.updateTileRackSubscription = this.gameService.updateTileRackEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe(() => this.updateTileRack());
        this.gameService.playingTiles
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((payload: ActionPlacePayload) => this.handlePlaceTiles(payload));
        this.gameService.newMessageValue.pipe(takeUntil(this.serviceDestroyed$)).subscribe((message: Message | null) => {
            if (message) this.handleNewMessage(message);
        });
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    private updateTileRack(): void {
        this.tiles = [];
        const localPlayer: AbstractPlayer | undefined = this.gameService.getLocalPlayer();
        if (!localPlayer || !localPlayer.getTiles()) {
            return;
        }
        localPlayer.getTiles().forEach((tile: Tile) => {
            this.tiles.push({ ...tile });
        });
    }

    private handlePlaceTiles(payload: ActionPlacePayload): void {
        for (const tile of payload.tiles) {
            const filtered = this.tiles.filter((t) => t.value === tile.value && t.letter === tile.letter && !t.played);
            if (filtered.length > 0) filtered[0].played = true;
        }
    }

    private handleNewMessage(message: Message): void {
        if (message.senderId === 'system-error') {
            for (const tile of this.tiles) {
                tile.played = false;
            }
        }
    }
}
