import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { BoardService } from '@app/services';
import { BoardComponent } from './board.component';
import SpyObj = jasmine.SpyObj;

describe('BoardComponent', () => {
    let boardServiceSpy: SpyObj<BoardService>;
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;

    const boardSizesToTest: Map<Vec2, Vec2> = new Map([
        [
            { x: -1, y: -1 },
            { x: 0, y: 0 },
        ],
        [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ],
        [
            { x: 15, y: 15 },
            { x: 15, y: 15 },
        ],
        [
            { x: 15, y: 10 },
            { x: 15, y: 10 },
        ],
    ]);

    beforeEach(async () => {
        boardServiceSpy = jasmine.createSpyObj('BoardService', ['getGridSize']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BoardComponent],
            providers: [{ provide: BoardService, useValue: boardServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    boardSizesToTest.forEach((testCase) => {
        const boardSize = testCase;
        const expectedBoardSize: Vec2 | undefined = boardSizesToTest.get(testCase);
        if (!expectedBoardSize) {
            // eslint-disable-next-line no-console
            console.log('Test board size was not mapped to expected board size');
            return;
        }
        it('Initializing board of size' + boardSize + ' should create board of size' + expectedBoardSize, () => {
            component.gridSize = boardSize;
            // eslint-disable-next-line dot-notation
            component['initializeBoard']();
            const actualBoardSize: Vec2 = { x: component.squareGrid[0].length, y: component.squareGrid.length };
            expect(actualBoardSize).toBe(expectedBoardSize);
        });
    });
});
