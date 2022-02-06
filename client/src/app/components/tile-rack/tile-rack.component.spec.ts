import { CommonModule } from '@angular/common';
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
import { Tile } from '@app/classes/tile';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services';
import { IconComponent } from '../icon/icon.component';
import { TileComponent } from '../tile/tile.component';
import { TileRackComponent } from './tile-rack.component';

import SpyObj = jasmine.SpyObj;

describe('TileRackComponent', () => {
    const EMPTY_TILE_RACK: Tile[] = [];
    let gameServiceSpy: SpyObj<GameService>;
    let component: TileRackComponent;
    let fixture: ComponentFixture<TileRackComponent>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['getLocalPlayer']);
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
        gameServiceSpy.getLocalPlayer.and.returnValue({
            name: 'Test',
            score: 0,
            tiles: [],
        });
        // eslint-disable-next-line dot-notation
        component['initializeTileRack']();
        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with tiles should return the player tiles', () => {
        const tiles: Tile[] = [{ letter: 'A', value: 10 }];
        gameServiceSpy.getLocalPlayer.and.returnValue({
            name: 'Test',
            score: 0,
            tiles,
        });
        // eslint-disable-next-line dot-notation
        component['initializeTileRack']();
        expect(component.tiles).toEqual(tiles);
    });
});
