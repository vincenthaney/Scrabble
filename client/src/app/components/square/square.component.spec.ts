import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_SQUARE_COLOR } from '@app/classes/game-constants';
import { SquareView } from '../../classes/square/square-view';
import { SquareComponent } from './square.component';

describe('SquareComponent', () => {
    let component: SquareComponent;
    let fixture: ComponentFixture<SquareComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SquareComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SquareComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.style).toEqual({
            'background-color': DEFAULT_SQUARE_COLOR,
        });
    });

    it('getSquareSize should return square size of associated SquareView', () => {
        const squareSize = { x: 1, y: 1 };
        const squareView: SquareView = new SquareView(null, squareSize);
        component.squareView = squareView;
        expect(component.getSquareSize()).toEqual(squareView.squareSize);
    });

    it('Square color initialization should assign color of SquareView', () => {
        const square = {
            tile: null,
            letterMultiplier: 2,
            wordMultiplier: 1,
        };
        const squareView: SquareView = new SquareView(null, { x: 0, y: 0 });
        component.squareView = squareView;
        // eslint-disable-next-line dot-notation
        component['initializeColor']();
        expect(component.style).toEqual({
            'background-color': squareView.getColor(),
        });
    });
});
