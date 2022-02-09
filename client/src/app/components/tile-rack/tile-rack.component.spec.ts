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
import { AbstractPlayer, Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services';
import { TileRackComponent } from './tile-rack.component';

class MockGameService {
    startGameEvent: EventEmitter<void> = new EventEmitter();
    getLocalPlayer(): AbstractPlayer | undefined {
        return new Player('id', 'name', []);
    }

    isLocalPlayerPlaying(): boolean {
        return true;
    }
}

describe('TileRackComponent', () => {
    const EMPTY_TILE_RACK: Tile[] = [];
    const mockGameService = new MockGameService();
    let component: TileRackComponent;
    let fixture: ComponentFixture<TileRackComponent>;

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
            providers: [{ provide: GameService, useValue: mockGameService }],
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

    it('should call initializeTileRack when startGameEvent is received', () => {
        const spy = spyOn<any>(component, 'initializeTileRack');
        mockGameService.startGameEvent.emit();
        expect(spy).toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe from startGameEvent', () => {
        const spy = spyOn<any>(component.startGameSubscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
    });

    it('Initializing TileRack with no Player in Game should return empty TileRack', () => {
        spyOn(mockGameService, 'getLocalPlayer').and.returnValue(undefined);
        component['initializeTileRack']();
        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with no tiles should return empty TileRack', () => {
        const localPlayer: AbstractPlayer = new Player('', 'Test', []);

        spyOn(mockGameService, 'getLocalPlayer').and.returnValue(localPlayer);
        spyOn(localPlayer, 'getTiles').and.returnValue([]);

        component['initializeTileRack']();

        expect(component.tiles).toEqual(EMPTY_TILE_RACK);
    });

    it('Initializing TileRack with player with tiles should return the player tiles', () => {
        const tiles: Tile[] = [{ letter: 'A', value: 10 }];
        const localPlayer: AbstractPlayer = new Player('', 'Test', []);

        spyOn(mockGameService, 'getLocalPlayer').and.returnValue(localPlayer);
        spyOn(localPlayer, 'getTiles').and.returnValue(tiles);

        component['initializeTileRack']();

        expect(component.tiles[0]).toBeTruthy();
    });
});
