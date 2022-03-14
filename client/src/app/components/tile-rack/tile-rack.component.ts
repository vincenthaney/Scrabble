import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import Direction from '@app/classes/board-navigator/direction';
import { Message } from '@app/classes/communication/message';
import { Tile } from '@app/classes/tile';
import { TileRackSelectType } from '@app/classes/tile-rack-select-type';
import { ARROW_LEFT, ARROW_RIGHT, ESCAPE } from '@app/constants/components-constants';
import { RACK_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size';
import { GameService } from '@app/services';
import { FocusableComponent } from '@app/services/focusable-components/focusable-component';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';
import { GameButtonActionService } from '@app/services/game-button-action/game-button-action.service';
import { preserveArrayOrder } from '@app/utils/preserve-array-order';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type RackTile = Tile & { isPlayed: boolean; isSelected: boolean };

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss', './tile-rack.component.2.scss'],
})
export class TileRackComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy {
    tiles: RackTile[] = [];
    selectedTiles: RackTile[] = [];
    selectionType: TileRackSelectType = TileRackSelectType.Exchange;
    tileFontSize: number = RACK_TILE_DEFAULT_FONT_SIZE;
    updateTileRackSubscription: Subscription;
    serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(
        public gameService: GameService,
        private readonly focusableComponentService: FocusableComponentsService,
        private readonly gameButtonActionService: GameButtonActionService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.subscribeToFocusableEvents();
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
        this.unsubscribeToFocusableEvents();
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    selectTile(selectType: TileRackSelectType, tile: RackTile): boolean {
        this.focus();

        if (this.selectionType === selectType && tile.isSelected) {
            this.unselectTile(tile);
            return false;
        }

        if (this.selectionType !== selectType || selectType === TileRackSelectType.Move) {
            this.selectionType = selectType;
            this.unselectAll();
        }

        tile.isSelected = true;
        this.selectedTiles.push(tile);

        return false; // return false so the browser doesn't show the context menu
    }

    selectTileToExchange(tile: RackTile): boolean {
        return this.selectTile(TileRackSelectType.Exchange, tile);
    }

    selectTileToMove(tile: RackTile): boolean {
        return this.selectTile(TileRackSelectType.Move, tile);
    }

    unselectTile(tile: RackTile): void {
        tile.isSelected = false;
        const index = this.selectedTiles.indexOf(tile);
        if (index >= 0) {
            this.selectedTiles.splice(index, 1);
        }
    }

    unselectAll(): void {
        this.selectedTiles.forEach((t) => (t.isSelected = false));
        this.selectedTiles = [];
    }

    focus(): void {
        this.focusableComponentService.setActiveKeyboardComponent(this);
    }

    canExchangeTiles(): boolean {
        return this.selectionType === TileRackSelectType.Exchange && this.selectedTiles.length > 0 && this.gameService.isLocalPlayerPlaying();
    }

    exchangeTiles(): void {
        if (!this.canExchangeTiles()) return;

        this.gameButtonActionService.sendExchangeAction(this.selectedTiles);
        this.selectedTiles.forEach((tile) => (tile.isPlayed = true));
        this.unselectAll();
    }

    protected onLoseFocusEvent(): void {
        this.unselectAll();
    }

    protected onFocusableEvent(event: KeyboardEvent): void {
        switch (event.key) {
            case ESCAPE:
                this.unselectAll();
                break;
            case ARROW_LEFT:
                this.moveSelectedTile(Direction.Left);
                break;
            case ARROW_RIGHT:
                this.moveSelectedTile(Direction.Right);
                break;
            default:
                this.selectTileFromKey(event);
        }
    }

    private selectTileFromKey(event: KeyboardEvent): void {
        const tiles = this.tiles.filter((tile) => tile.letter.toLowerCase() === event.key.toLowerCase());

        if (tiles.length === 0) return this.unselectAll();

        const selectedIndex = tiles.findIndex((tile) => tile.isSelected);
        const indexToSelect = (selectedIndex + 1) % tiles.length;
        this.selectTileToMove(tiles[indexToSelect]);
    }

    private moveSelectedTile(direction: Direction): void {
        if (this.selectionType !== TileRackSelectType.Move) return;
        if (this.selectedTiles.length === 0) return;

        const tile = this.selectedTiles[0];
        const index = this.tiles.indexOf(tile);

        let newIndex = (index + direction) % this.tiles.length;
        if (newIndex < 0) newIndex += this.tiles.length;

        this.tiles.splice(index, 1);
        this.tiles.splice(newIndex, 0, tile);
    }

    private updateTileRack(): void {
        const player = this.gameService.getLocalPlayer();
        if (!player) return;

        const previousTiles = [...this.tiles];
        const newTiles = [...player.getTiles()];

        this.unselectAll();
        this.tiles = preserveArrayOrder(newTiles, previousTiles, (a, b) => a.letter === b.letter).map(this.createRackTile);
    }

    private createRackTile(tile: Tile): RackTile {
        return { ...tile, isPlayed: false, isSelected: false };
    }

    private handlePlaceTiles(payload: ActionPlacePayload): void {
        for (const tile of payload.tiles) {
            const filtered = this.tiles.filter((t) => t.value === tile.value && t.letter === tile.letter && !t.isPlayed);
            if (filtered.length > 0) filtered[0].isPlayed = true;
        }
    }

    private handleNewMessage(message: Message): void {
        if (message.senderId === 'system-error') {
            for (const tile of this.tiles) {
                tile.isPlayed = false;
            }
        }
    }
}
