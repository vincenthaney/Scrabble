/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
import { Orientation } from '@app/classes/orientation';
import { AbstractPlayer, Player } from '@app/classes/player';
import { TileRackSelectType } from '@app/classes/tile-rack-select-type';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { ESCAPE } from '@app/constants/components-constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { BehaviorSubject } from 'rxjs';
import { RackTile, TileRackComponent } from './tile-rack.component';
import SpyObj = jasmine.SpyObj;

describe('TileRackComponent', () => {
    const EMPTY_TILE_RACK: RackTile[] = [];
    let gameServiceSpy: SpyObj<GameService>;
    let gameViewEventManagerSpy: SpyObj<GameViewEventManagerService>;
    let component: TileRackComponent;
    let fixture: ComponentFixture<TileRackComponent>;
    let handleUsedTileSpy: jasmine.Spy;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj(
            'GameService',
            ['getLocalPlayer', 'isLocalPlayerPlaying', 'subscribeToUpdateTileRackEvent'],
            ['playingTiles'],
        );
        gameServiceSpy.getLocalPlayer.and.returnValue(new Player('id', 'name', []));
        gameServiceSpy.isLocalPlayerPlaying.and.returnValue(true);

        const tileRackUpdate$ = new Subject();
        const usedTiles$ = new Subject();
        const message$ = new Subject();
        gameViewEventManagerSpy = jasmine.createSpyObj('GameViewEventManagerService', ['emitGameViewEvent', 'subscribeToGameViewEvent']);
        gameViewEventManagerSpy.emitGameViewEvent.and.callFake((eventType: string) => {
            switch (eventType) {
                case 'tileRackUpdate':
                    tileRackUpdate$.next();
                    break;
                case 'usedTiles':
                    usedTiles$.next();
                    break;
                case 'newMessage':
                    message$.next();
            }
        });

        gameViewEventManagerSpy.subscribeToGameViewEvent.and.callFake((eventType: string, destroy$: Observable<boolean>, next: any): Subscription => {
            switch (eventType) {
                case 'tileRackUpdate':
                    return tileRackUpdate$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'usedTiles':
                    return usedTiles$.pipe(takeUntil(destroy$)).subscribe(next);
                case 'newMessage':
                    return message$.pipe(takeUntil(destroy$)).subscribe(next);
            }
            return new Subscription();
        });
    });

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
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: GameViewEventManagerService, useValue: gameViewEventManagerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TileRackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        handleUsedTileSpy = spyOn<any>(component, 'handleUsedTiles');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call updateTileRack when tileRackUpdate is received', () => {
        const spy = spyOn<any>(component, 'updateTileRack');
        gameViewEventManagerSpy.emitGameViewEvent('tileRackUpdate');
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleUsedTiles on usedTiles event', () => {
        gameViewEventManagerSpy.emitGameViewEvent('usedTiles', undefined);
        expect(handleUsedTileSpy).toHaveBeenCalled();
    });

    it('Initializing TileRack with no Player in Game should return empty TileRack', () => {
        gameServiceSpy.getLocalPlayer.and.returnValue(undefined);
        component['updateTileRack']();
        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with no tiles should return empty TileRack', () => {
        const localPlayer: AbstractPlayer = new Player('', 'Test', []);

        gameServiceSpy.getLocalPlayer.and.returnValue(localPlayer);
        spyOn(localPlayer, 'getTiles').and.returnValue([]);

        component['updateTileRack']();

        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with tiles should return the player tiles', () => {
        const tiles: RackTile[] = [{ letter: 'A', value: 10, isUsed: false, isSelected: false }];
        const localPlayer: AbstractPlayer = new Player('', 'Test', []);

        gameServiceSpy.getLocalPlayer.and.returnValue(localPlayer);
        spyOn(localPlayer, 'getTiles').and.returnValue(tiles);

        component['updateTileRack']();

        expect(component.tiles[0]).toBeTruthy();
    });

    it('should mark tiles as played but only those in playedTiles', () => {
        const tiles: RackTile[] = [
            { letter: 'A', value: 0, isUsed: false, isSelected: false },
            { letter: 'B', value: 0, isUsed: false, isSelected: false },
        ];
        const playedTiles: RackTile[] = [{ ...tiles[0] }, { letter: 'Z', value: 0, isUsed: false, isSelected: false }];
        component.tiles = tiles;
        const payload = { tiles: playedTiles, orientation: Orientation.Horizontal, startPosition: { row: 0, column: 9 } };

        handleUsedTileSpy.and.callThrough();
        component['handleUsedTiles'](payload);

        expect(tiles[0].isUsed).toBeTrue();
        expect(tiles[1].isUsed).toBeFalsy();
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
    });

    describe('canExchangeTiles', () => {
        let isLocalPlayerPlayingSpy: jasmine.Spy;

        beforeEach(() => {
            component.selectionType = TileRackSelectType.Exchange;
            component.selectedTiles = [{}, {}] as RackTile[];
            isLocalPlayerPlayingSpy = gameServiceSpy.isLocalPlayerPlaying.and.returnValue(true);
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
            component.selectedTiles = [{ isUsed: false }, { isPlayed: false }] as RackTile[];
        });

        it('should send exchange action', () => {
            component.exchangeTiles();
            expect(sendExchangeActionSpy).toHaveBeenCalledOnceWith(component.selectedTiles);
        });

        it('should set all selectedTiles as played', () => {
            const tiles = [...component.selectedTiles];
            component.exchangeTiles();
            expect(tiles.every((tile) => tile.isUsed)).toBeTrue();
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
