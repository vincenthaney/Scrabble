/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
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
import { Message } from '@app/classes/communication/message';
import { Orientation } from '@app/classes/orientation';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services';
// import { BehaviorSubject } from 'rxjs';
import { RackTile, TileRackComponent } from './tile-rack.component';
import SpyObj = jasmine.SpyObj;

describe('TileRackComponent', () => {
    const EMPTY_TILE_RACK: Tile[] = [];
    let gameServiceSpy: SpyObj<GameService>;
    let component: TileRackComponent;
    let fixture: ComponentFixture<TileRackComponent>;
    let handlePlaceTileSpy: jasmine.Spy;
    let handleNewMessageSpy: jasmine.Spy;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj(
            'GameService',
            ['getLocalPlayer', 'isLocalPlayerPlaying', 'subscribeToUpdateTileRackEvent'],
            ['playingTiles'],
        );
        gameServiceSpy.getLocalPlayer.and.returnValue(new Player('id', 'name', []));
        gameServiceSpy.isLocalPlayerPlaying.and.returnValue(true);
        gameServiceSpy.subscribeToUpdateTileRackEvent.and.callThrough();
        gameServiceSpy.playingTiles = new EventEmitter();
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
            ],
            declarations: [TileRackComponent, IconComponent, TileComponent],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
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
        gameServiceSpy['updateTileRack$'].next();
        expect(spy).toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe from startGameEvent', () => {
        const spy = spyOn<any>(component.updateTileRackSubscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
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
        const tiles: Tile[] = [{ letter: 'A', value: 10 }];
        const localPlayer: AbstractPlayer = new Player('', 'Test', []);

        gameServiceSpy.getLocalPlayer.and.returnValue(localPlayer);
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
            { letter: 'A', value: 0 },
            { letter: 'B', value: 0 },
        ];
        const playedTiles: Tile[] = [{ ...tiles[0] }, { letter: 'Z', value: 0 }];
        component.tiles = tiles;
        const payload = { tiles: playedTiles, orientation: Orientation.Horizontal, startPosition: { row: 0, column: 9 } };

        handlePlaceTileSpy.and.callThrough();
        component['handlePlaceTiles'](payload);

        expect(tiles[0].played).toBeTrue();
        expect(tiles[1].played).toBeFalsy();
    });

    it('should set all tiles to not played when call handleNewMessage', () => {
        const tiles: RackTile[] = [
            { letter: 'A', value: 0, played: true },
            { letter: 'B', value: 0 },
        ];
        component.tiles = tiles;

        handleNewMessageSpy.and.callThrough();
        component['handleNewMessage']({ senderId: 'system-error' } as Message);

        for (const tile of tiles) expect(tile.played).toBeFalse();
    });
});
