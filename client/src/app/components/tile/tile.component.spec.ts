import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UNDEFINED_TILE } from '@app/classes/game-constants';
import { Tile } from '@app/classes/tile';
import { TileComponent } from './tile.component';

describe('TileComponent', () => {
    let component: TileComponent;
    let fixture: ComponentFixture<TileComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TileComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should return undefined tile if tile is undefined', () => {
        expect(component.getTile()).toEqual(UNDEFINED_TILE);
    });

    it('Should return tile when tile is defined', () => {
        const expectedTile: Tile = { letter: 'A', value: 5 };
        // eslint-disable-next-line dot-notation
        component['tile'] = expectedTile;
        expect(component.getTile()).toEqual(expectedTile);
    });
});
