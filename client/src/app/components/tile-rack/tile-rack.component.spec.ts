import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tile } from '@app/classes/tile';
import { GameService } from '@app/services';
import { TileRackComponent } from './tile-rack.component';

import SpyObj = jasmine.SpyObj;

describe('TileRackComponent', () => {
    const EMPTY_TILE_RACK: Tile[] = [];
    let gameServiceSpy: SpyObj<GameService>;
    let component: TileRackComponent;
    let fixture: ComponentFixture<TileRackComponent>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TileRackComponent],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TileRackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Initializing TileRack with no Player in Game should return empty TileRack', () => {
        // eslint-disable-next-line dot-notation
        component['initializeTileRack']();
        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with no tiles should return empty TileRack', () => {
        gameServiceSpy.localPlayer = {
            name: 'Test',
            score: 0,
            tiles: [],
        };
        // eslint-disable-next-line dot-notation
        component['initializeTileRack']();
        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with tiles should return the player tiles', () => {
        const tiles: Tile[] = [{ letter: 'A', value: 10 }];
        gameServiceSpy.localPlayer = {
            name: 'Test',
            score: 0,
            tiles,
        };
        // eslint-disable-next-line dot-notation
        component['initializeTileRack']();
        expect(component.tiles).toEqual(tiles);
    });
});
