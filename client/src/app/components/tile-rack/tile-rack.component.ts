import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';
import { AbstractPlayer } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { RACK_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
import { Subject } from 'rxjs';

export type RackTile = Tile & { played?: boolean };

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss'],
})
export class TileRackComponent implements OnInit, OnDestroy {
    tiles: RackTile[];
    tileFontSize: number = RACK_TILE_DEFAULT_FONT_SIZE;
    componentDestroyed$: Subject<boolean> = new Subject();

    constructor(public gameService: GameService, private gameViewEventManagerService: GameViewEventManagerService) {}

    ngOnInit(): void {
        this.updateTileRack();
        this.gameViewEventManagerService.subscribeToGameViewEvent('tileRackUpdate', this.componentDestroyed$, () => this.updateTileRack());
        this.gameViewEventManagerService.subscribeToGameViewEvent('tilesPlayed', this.componentDestroyed$, (payload: ActionPlacePayload) =>
            this.handlePlaceTiles(payload),
        );
        this.gameViewEventManagerService.subscribeToGameViewEvent('newMessage', this.componentDestroyed$, (message: Message) =>
            this.handleNewMessage(message),
        );
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
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
