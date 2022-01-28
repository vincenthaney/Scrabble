import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_SQUARE_COLOR } from '@app/classes/game-constants';
import { COLORS } from '@app/constants/colors';
import { SquareView } from './square-view';
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
        const squareView: SquareView = {
            square: null,
            squareSize,
            color: COLORS.Beige,
        };
        component.squareView = squareView;
        expect(component.getSquareSize()).toEqual(squareView.squareSize);
    });

    it('Square color initialization should assign color of SquareView', () => {
        const squareView: SquareView = {
            square: null,
            squareSize: { x: 0, y: 0 },
            color: COLORS.SquareDarkBlue,
        };
        component.squareView = squareView;
        // eslint-disable-next-line dot-notation
        component['initializeColor']();
        expect(component.style).toEqual({
            'background-color': squareView.color,
        });
    });
});
