import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MARGIN_COLUMN_SIZE } from '@app/classes/game-constants';
import { Vec2 } from '@app/classes/vec2';
import { BoardService } from '@app/services';
import { BoardComponent } from './board.component';
import SpyObj = jasmine.SpyObj;

describe('BoardComponent', () => {
    let boardServiceSpy: SpyObj<BoardService>;
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;

    const boardServiceGridSize: Vec2 = { x: 15, y: 15 };
    const boardSizesToTest = [
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
    ];

    beforeEach(async () => {
        boardServiceSpy = jasmine.createSpyObj('BoardService', ['getGridSize']);
        boardServiceSpy.getGridSize.and.returnValue(boardServiceGridSize);
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
        const boardSize = testCase[0];
        const expectedBoardSize: Vec2 | undefined = testCase[1];

        if (!expectedBoardSize) {
            // eslint-disable-next-line no-console
            console.log('Test board size was not mapped to expected board size');
            return;
        }
        it(
            'Initializing board of size ' +
                boardSize.x +
                ' : ' +
                boardSize.y +
                ' should create board of size ' +
                expectedBoardSize.x +
                ' : ' +
                expectedBoardSize.y,
            () => {
                component.gridSize = boardSize;
                // eslint-disable-next-line dot-notation
                component['initializeBoard']();

                const actualRowAmount = component.squareGrid.length;
                const actualColAmount = expectedBoardSize.y <= 0 ? 0 : component.squareGrid[0].length;

                const actualBoardSize: Vec2 = { x: actualColAmount, y: actualRowAmount };
                expect(actualBoardSize).toEqual(expectedBoardSize);
            },
        );
    });

    it('Call to BoardService getGridSize should assign right value to gridSize', () => {
        expect(component.gridSize).toEqual(boardServiceGridSize);
    });

    it('Initialization of colAmount should be BoardService.grid.x + MARGIN_COLUMN_SIZE', () => {
        expect(component.colAmount).toEqual(boardServiceGridSize.x + MARGIN_COLUMN_SIZE);
    });
});
