/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import Direction from '@app/classes/board-navigator/direction';
import { Message } from '@app/classes/communication/message';
import { Orientation } from '@app/classes/orientation';
import { AbstractPlayer, Player } from '@app/classes/player';
import { LetterValue } from '@app/classes/tile';
import { TileRackSelectType } from '@app/classes/tile-rack-select-type';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { ARROW_LEFT, ARROW_RIGHT, ESCAPE } from '@app/constants/components-constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services';
import { BehaviorSubject } from 'rxjs';
import { RackTile, TileRackComponent } from './tile-rack.component';

class MockGameService {
    updateTileRackEvent: EventEmitter<void> = new EventEmitter();
    newMessageValue = new BehaviorSubject<unknown>({});
    playingTiles: EventEmitter<unknown> = new EventEmitter();

    getLocalPlayer(): AbstractPlayer | undefined {
        return new Player('id', 'name', []);
    }

    isLocalPlayerPlaying(): boolean {
        return true;
    }
}

describe('TileRackComponent', () => {
    const EMPTY_TILE_RACK: RackTile[] = [];
    const mockGameService = new MockGameService();
    let component: TileRackComponent;
    let fixture: ComponentFixture<TileRackComponent>;
    let handlePlaceTileSpy: jasmine.Spy;
    let handleNewMessageSpy: jasmine.Spy;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatGridListModule,
                MatCardModule,
                MatProgressSpinnerModule,
                MatIconModule,
                MatButtonModule,
                ReactiveFormsModule,
                CommonModule,
                MatInputModule,
                BrowserAnimationsModule,
                AppMaterialModule,
                MatFormFieldModule,
                FormsModule,
                MatDialogModule,
                HttpClientTestingModule,
            ],
            declarations: [TileRackComponent, IconComponent, TileComponent],
            providers: [{ provide: GameService, useValue: mockGameService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TileRackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        handleNewMessageSpy = spyOn<any>(component, 'handleNewMessage');
        handlePlaceTileSpy = spyOn<any>(component, 'handlePlaceTiles');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call initializeTileRack when startGameEvent is received', () => {
        const spy = spyOn<any>(component, 'updateTileRack');
        mockGameService.updateTileRackEvent.emit();
        expect(spy).toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe from startGameEvent', () => {
        const spy = spyOn<any>(component.updateTileRackSubscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
    });

    it('Initializing TileRack with no Player in Game should return empty TileRack', () => {
        spyOn(mockGameService, 'getLocalPlayer').and.returnValue(undefined);
        component['updateTileRack']();
        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with no tiles should return empty TileRack', () => {
        const localPlayer: AbstractPlayer = new Player('', 'Test', []);

        spyOn(mockGameService, 'getLocalPlayer').and.returnValue(localPlayer);
        spyOn(localPlayer, 'getTiles').and.returnValue([]);

        component['updateTileRack']();

        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with tiles should return the player tiles', () => {
        const tiles: RackTile[] = [{ letter: 'A', value: 10, isPlayed: false, isSelected: false }];
        const localPlayer: AbstractPlayer = new Player('', 'Test', []);

        spyOn(mockGameService, 'getLocalPlayer').and.returnValue(localPlayer);
        spyOn(localPlayer, 'getTiles').and.returnValue(tiles);

        component['updateTileRack']();

        expect(component.tiles[0]).toBeTruthy();
    });

    it('should call handlePlaceTiles on playTiles event', () => {
        component['gameService'].playingTiles.emit();
        expect(handlePlaceTileSpy).toHaveBeenCalled();
    });

    it('should mark tiles as played but only those in playedTiles', () => {
        const tiles: RackTile[] = [
            { letter: 'A', value: 0, isPlayed: false, isSelected: false },
            { letter: 'B', value: 0, isPlayed: false, isSelected: false },
        ];
        const playedTiles: RackTile[] = [{ ...tiles[0] }, { letter: 'Z', value: 0, isPlayed: false, isSelected: false }];
        component.tiles = tiles;
        const payload = { tiles: playedTiles, orientation: Orientation.Horizontal, startPosition: { row: 0, column: 9 } };

        handlePlaceTileSpy.and.callThrough();
        component['handlePlaceTiles'](payload);

        expect(tiles[0].isPlayed).toBeTrue();
        expect(tiles[1].isPlayed).toBeFalsy();
    });

    it('should set all tiles to not played when call handleNewMessage', () => {
        const tiles: RackTile[] = [
            { letter: 'A', value: 0, isPlayed: true, isSelected: false },
            { letter: 'B', value: 0, isPlayed: false, isSelected: false },
        ];
        component.tiles = tiles;

        handleNewMessageSpy.and.callThrough();
        component['handleNewMessage']({ senderId: 'system-error' } as Message);

        for (const tile of tiles) expect(tile.isPlayed).toBeFalse();
    });

    describe('selectTile', () => {
        it('should set tile.selected to true', () => {
            const type: TileRackSelectType = 'type' as TileRackSelectType;
            const tile: RackTile = { isSelected: false } as unknown as RackTile;

            component.selectTile(type, tile);

            expect(tile.isSelected).toBeTrue();
        });

        it('should add tile to selectedTiles', () => {
            const type: TileRackSelectType = 'type' as TileRackSelectType;
            const tile: RackTile = {} as unknown as RackTile;

            component.selectedTiles = [];
            component.selectTile(type, tile);

            expect(component.selectedTiles).toHaveSize(1);
            expect(component.selectedTiles).toContain(tile);
        });

        it('should call unselectTile if same tile and tile is selected', () => {
            const type: TileRackSelectType = 'type' as TileRackSelectType;
            const tile: RackTile = { isSelected: true } as unknown as RackTile;
            const spy = spyOn(component, 'unselectTile');

            component['selectionType'] = type;
            component.selectTile(type, tile);

            expect(spy).toHaveBeenCalledOnceWith(tile);
        });

        it('should return false', () => {
            const type: TileRackSelectType = 'type' as TileRackSelectType;
            const tile: RackTile = { isSelected: false } as unknown as RackTile;

            const result = component.selectTile(type, tile);

            expect(result).toBeFalse();
        });

        it('should call unselectAll if type is move', () => {
            const type: TileRackSelectType = TileRackSelectType.Move;
            const tile: RackTile = {} as unknown as RackTile;
            const spy = spyOn(component, 'unselectAll');

            component.selectTile(type, tile);

            expect(spy).toHaveBeenCalled();
        });

        it('should call unselectAll if type changes', () => {
            const type: TileRackSelectType = 'other-type' as TileRackSelectType;
            const tile: RackTile = {} as unknown as RackTile;
            const spy = spyOn(component, 'unselectAll');

            component['selectionType'] = 'type' as TileRackSelectType;
            component.selectTile(type, tile);

            expect(spy).toHaveBeenCalled();
        });

        it('should return false if tile already selected', () => {
            const type: TileRackSelectType = 'type' as TileRackSelectType;
            const tile: RackTile = { isSelected: true } as unknown as RackTile;
            spyOn(component, 'unselectTile');

            component['selectionType'] = type;
            const result = component.selectTile(type, tile);

            expect(result).toBeFalse();
        });
    });

    describe('selectTileExchange', () => {
        it('should call selectType with type exchange', () => {
            const tile: RackTile = {} as unknown as RackTile;
            const spy = spyOn(component, 'selectTile');

            component.selectTileExchange(tile);

            expect(spy).toHaveBeenCalledOnceWith(TileRackSelectType.Exchange, tile);
        });
    });

    describe('selectTileMove', () => {
        it('should call selectType with type move', () => {
            const tile: RackTile = {} as unknown as RackTile;
            const spy = spyOn(component, 'selectTile');

            component.selectTileMove(tile);

            expect(spy).toHaveBeenCalledOnceWith(TileRackSelectType.Move, tile);
        });
    });

    describe('unselectTile', () => {
        it('should set tile.selected to false', () => {
            const tile: RackTile = { isSelected: true } as unknown as RackTile;

            component.unselectTile(tile);

            expect(tile.isSelected).toBeFalse();
        });

        it('should remove tile from selectedTiles', () => {
            const tile: RackTile = { isSelected: true } as unknown as RackTile;

            component.selectedTiles = [tile];
            component.unselectTile(tile);

            expect(component.selectedTiles).not.toContain(tile);
        });
    });

    describe('unselectAll', () => {
        it('should set tile.selected to false for all tiles', () => {
            const tiles: RackTile[] = [];
            for (let i = 0; i < 3; ++i) tiles.push({ isSelected: true } as RackTile);

            component.selectedTiles = tiles;
            component.unselectAll();

            tiles.forEach((tile) => expect(tile.isSelected).toBeFalse());
        });

        it('should remove all tiles from selectedTiles', () => {
            const tiles: RackTile[] = [];
            for (let i = 0; i < 3; ++i) tiles.push({ isSelected: true } as RackTile);

            component.selectedTiles = tiles;
            component.unselectAll();

            expect(component.selectedTiles).toHaveSize(0);
        });
    });

    describe('focus', () => {
        it('should call setActiveKeyboardComponent', () => {
            const spy = spyOn(component['focusableComponentService'], 'setActiveKeyboardComponent');

            component.focus();

            expect(spy).toHaveBeenCalledOnceWith(component);
        });
    });

    describe('onLoseFocusEvent', () => {
        it('should call unselectAll', () => {
            const spy = spyOn(component, 'unselectAll');

            component['onLoseFocusEvent']();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onFocusableEvent', () => {
        it('should call unselectAll on ESC', () => {
            const event = { key: ESCAPE } as KeyboardEvent;
            const spy = spyOn(component, 'unselectAll');

            component['onFocusableEvent'](event);

            expect(spy).toHaveBeenCalled();
        });

        it('should call moveSelectedTile on arrow', () => {
            const tests: [arrow: string, direction: Direction][] = [
                [ARROW_LEFT, Direction.Backward],
                [ARROW_RIGHT, Direction.Forward],
            ];

            const spy = spyOn<any>(component, 'moveSelectedTile');

            for (const [arrow, direction] of tests) {
                const event = { key: arrow } as KeyboardEvent;

                component['onFocusableEvent'](event);

                expect(spy).toHaveBeenCalledOnceWith(direction);

                spy.calls.reset();
            }
        });

        it('should call selectTileFromKey if is key', () => {
            const event = { key: 'A' } as KeyboardEvent;
            const spy = spyOn<any>(component, 'selectTileFromKey');

            component['onFocusableEvent'](event);

            expect(spy).toHaveBeenCalledOnceWith(event);
        });
    });

    describe('selectTileFromKey', () => {
        let tiles: RackTile[];
        let selectTileMoveSpy: jasmine.Spy;

        beforeEach(() => {
            tiles = [
                { letter: 'A', isSelected: false },
                { letter: 'B', isSelected: false },
                { letter: 'C', isSelected: false },
                { letter: 'B', isSelected: false },
                { letter: 'D', isSelected: false },
                { letter: 'B', isSelected: false },
            ] as RackTile[];
            component.tiles = tiles;
            selectTileMoveSpy = spyOn(component, 'selectTileMove');
        });

        it('should call selectTileMove', () => {
            const index = 0;
            const key = tiles[index].letter;

            component['selectTileFromKey']({ key } as KeyboardEvent);

            expect(selectTileMoveSpy).toHaveBeenCalledOnceWith(tiles[index]);
        });

        it('should call selectTileMove is next tile with same letter if multiple', () => {
            tiles[1].isSelected = true;
            const index = 3;
            const key = tiles[index].letter;

            component['selectTileFromKey']({ key } as KeyboardEvent);

            expect(selectTileMoveSpy).toHaveBeenCalledOnceWith(tiles[index]);
        });

        it('should call selectTileMove is next tile with same letter if multiple (2)', () => {
            tiles[3].isSelected = true;
            const index = 5;
            const key = tiles[index].letter;

            component['selectTileFromKey']({ key } as KeyboardEvent);

            expect(selectTileMoveSpy).toHaveBeenCalledOnceWith(tiles[index]);
        });

        it('should not call selectTileMove if no tile matches', () => {
            const key = 'not a letter';

            component['selectTileFromKey']({ key } as KeyboardEvent);

            expect(selectTileMoveSpy).not.toHaveBeenCalled();
        });
    });

    describe('moveSelectedTile', () => {
        const tests: [selected: number, direction: Direction, expected: LetterValue[]][] = [
            [1, Direction.Backward, ['B', 'A', 'C', 'D']],
            [1, Direction.Forward, ['A', 'C', 'B', 'D']],
            [0, Direction.Backward, ['B', 'C', 'D', 'A']],
            [3, Direction.Forward, ['D', 'A', 'B', 'C']],
        ];
        let tiles: RackTile[];

        beforeEach(() => {
            tiles = [
                { letter: 'A', isSelected: false },
                { letter: 'B', isSelected: false },
                { letter: 'C', isSelected: false },
                { letter: 'D', isSelected: false },
            ] as RackTile[];
            component.tiles = tiles;
        });

        for (let i = 0; i < tests.length; ++i) {
            it(`should move selected tile (${i + 1})`, () => {
                const [selected, direction, expected] = tests[i];

                component.selectTileMove(tiles[selected]);

                component['moveSelectedTile'](direction);

                expect(component.tiles.map((t) => t.letter)).toEqual(expected);
            });
        }

        it('should not change tiles if selection type is not move', () => {
            const expected = [...tiles];

            component.selectTileMove(tiles[0]);
            component.selectionType = TileRackSelectType.Exchange;

            component['moveSelectedTile'](Direction.Forward);

            expect(component.tiles.map((t) => t.letter)).toEqual(expected.map((t) => t.letter));
        });

        it('should not change tiles if selectedTiles is empty', () => {
            const expected = [...tiles];

            component.selectTileMove(tiles[0]);
            component.selectedTiles = [];

            component['moveSelectedTile'](Direction.Forward);

            expect(component.tiles.map((t) => t.letter)).toEqual(expected.map((t) => t.letter));
        });
    });

    describe('canExchangeTiles', () => {
        let isLocalPlayerPlayingSpy: jasmine.Spy;

        beforeEach(() => {
            component.selectionType = TileRackSelectType.Exchange;
            component.selectedTiles = [{}, {}] as RackTile[];
            isLocalPlayerPlayingSpy = spyOn(component.gameService, 'isLocalPlayerPlaying').and.returnValue(true);
        });

        it('should be true if can exchange', () => {
            expect(component.canExchangeTiles()).toBeTrue();
        });

        it('should be false if selectionType is not exchange', () => {
            component.selectionType = TileRackSelectType.Move;
            expect(component.canExchangeTiles()).toBeFalse();
        });

        it('should be false if selectedTiles is empty', () => {
            component.selectedTiles = [];
            expect(component.canExchangeTiles()).toBeFalse();
        });

        it('should be false if is not local player playing', () => {
            isLocalPlayerPlayingSpy.and.returnValue(false);
            expect(component.canExchangeTiles()).toBeFalse();
        });
    });

    describe('exchangeTiles', () => {
        let sendExchangeActionSpy: jasmine.Spy;
        let unselectAllSpy: jasmine.Spy;
        let canExchangeTile: jasmine.Spy;

        beforeEach(() => {
            sendExchangeActionSpy = spyOn(component['gameButtonActionService'], 'sendExchangeAction');
            unselectAllSpy = spyOn(component, 'unselectAll');
            canExchangeTile = spyOn(component, 'canExchangeTiles').and.returnValue(true);
            component.selectedTiles = [{ isPlayed: false }, { isPlayed: false }] as RackTile[];
        });

        it('should send exchange action', () => {
            component.exchangeTiles();
            expect(sendExchangeActionSpy).toHaveBeenCalledOnceWith(component.selectedTiles);
        });

        it('should set all selectedTiles as played', () => {
            const tiles = [...component.selectedTiles];
            component.exchangeTiles();
            expect(tiles.every((tile) => tile.isPlayed)).toBeTrue();
        });

        it('should call unselectAll', () => {
            component.exchangeTiles();
            expect(unselectAllSpy).toHaveBeenCalled();
        });

        it('should not send action if cannot exchange', () => {
            canExchangeTile.and.returnValue(false);
            component.exchangeTiles();
            expect(sendExchangeActionSpy).not.toHaveBeenCalled();
        });
    });
});
