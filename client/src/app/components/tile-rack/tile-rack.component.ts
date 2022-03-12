import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';
import { AbstractPlayer } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { TileRackSelectType } from '@app/classes/tile-rack-select-type';
import { RACK_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size';
import { GameService } from '@app/services';
import { FocusableComponent } from '@app/services/focusable-components/focusable-component';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type RackTile = Tile & { played: boolean; selected: boolean };

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss', './tile-rack.component.2.scss'],
})
export class TileRackComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy {
    tiles: RackTile[];
    selectedTiles: RackTile[] = [];
    selectionType: TileRackSelectType = 'exchange';
    tileFontSize: number = RACK_TILE_DEFAULT_FONT_SIZE;
    updateTileRackSubscription: Subscription;
    serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(public gameService: GameService, private readonly focusableComponentService: FocusableComponentsService) {
        super();
    }

    ngOnInit(): void {
        this.subscribe();
        this.updateTileRack();
        this.updateTileRackSubscription = this.gameService.updateTileRackEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe(() => this.updateTileRack());
        this.gameService.playingTiles
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((payload: ActionPlacePayload) => this.handlePlaceTiles(payload));
        this.gameService.newMessageValue.pipe(takeUntil(this.serviceDestroyed$)).subscribe((message: Message) => this.handleNewMessage(message));
    }

    ngOnDestroy(): void {
        this.destroy();
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    selectTile(type: TileRackSelectType, tile: RackTile): boolean {
        if (this.selectionType === type && tile.selected) {
            this.unselectTile(tile);
            return false;
        }

        if (this.selectionType !== type || type === 'move') {
            this.selectionType = type;
            this.unselectAll();
        }

        tile.selected = true;
        this.selectedTiles.push(tile);

        return false; // return false so the browser doesn't show the context menu
    }

    unselectTile(tile: RackTile) {
        tile.selected = false;
        const index = this.selectedTiles.indexOf(tile);
        if (index >= 0) {
            this.selectedTiles.splice(index, 1);
        }
    }

    unselectAll() {
        this.selectedTiles.forEach((t) => (t.selected = false));
        this.selectedTiles = [];
    }

    focus() {
        this.focusableComponentService.setActiveKeyboardComponent(this);
    }

    protected onLoseFocusEvent() {
        this.unselectAll();
    }

    private updateTileRack(): void {
        this.tiles = [];
        const localPlayer: AbstractPlayer | undefined = this.gameService.getLocalPlayer();
        if (!localPlayer || !localPlayer.getTiles()) {
            return;
        }
        localPlayer.getTiles().forEach((tile: Tile) => {
            this.tiles.push({ ...tile, played: false, selected: false });
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
