/* eslint-disable dot-notation */
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
import { Square, SquareView } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { UNDEFINED_GRID_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { AppMaterialModule } from '@app/modules/material.module';
import { BoardService } from '@app/services';
import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
    let boardService: BoardService;
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

    const mockSquare: Square = {
        tile: null,
        multiplier: null,
        wasMultiplierUsed: false,
        isCenter: false,
    };
    const mockGrid: Square[][] = [].constructor(boardServiceGridSize.y).forEach((i: number) => {
        mockGrid[i] = [];
        [].constructor(boardServiceGridSize.x).forEach((j: number) => {
            mockGrid[i][j] = mockSquare;
        });
    });

    beforeEach(async () => {
        boardService = new BoardService();
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
            declarations: [BoardComponent],
            providers: [{ provide: BoardService, useValue: boardService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    boardSizesToTest.forEach((testCase) => {
        const boardSize = testCase[0];
        const expectedBoardSize: Vec2 = testCase[1];

        if (!expectedBoardSize) {
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
                spyOn(boardService, 'getGridSize').and.returnValue(boardSize);

                fixture = TestBed.createComponent(BoardComponent);
                component = fixture.componentInstance;
                fixture.detectChanges();

                // eslint-disable-next-line dot-notation
                component['initializeBoard']();

                const actualRowAmount = component.squareGrid.length;

                /*
                    If the Grid size is supposed to be smaller or equal to 0,
                    then each row of the grid will not be initialized.
                    In that case, we assign null values to the actual column amount.
                    If the expected size is greater than 0, then the row length is defined
                */
                const actualColAmount = expectedBoardSize.y <= 0 ? 0 : component.squareGrid[0].length;

                const actualBoardSize: Vec2 = { x: actualColAmount, y: actualRowAmount };
                expect(actualBoardSize).toEqual(expectedBoardSize);
            },
        );
    });

    it('Call to BoardService getGridSize should assign right value to gridSize', () => {
        expect(component.gridSize).toEqual(boardServiceGridSize);
    });

    it('If BoardService returns no grid, component should have UNDEFINED_GRID_SIZE size', () => {
        spyOnProperty(boardService, 'grid', 'get').and.returnValue(null);

        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.gridSize).toEqual(UNDEFINED_GRID_SIZE);
    });

    it('If BoardService returns grid with null squares, should assign UNDEFINED_SQUARE to board', () => {
        const grid = [
            [mockSquare, null],
            [mockSquare, null],
        ];
        const expectedGrid = [
            [mockSquare, UNDEFINED_SQUARE],
            [mockSquare, UNDEFINED_SQUARE],
        ];
        spyOn(boardService, 'getGridSize').and.returnValue({ x: 2, y: 2 });

        // We need to spy on the property otherwise we cannot return a grid with null
        // values because of TypeScript's type enforcing
        spyOnProperty(boardService, 'grid', 'get').and.returnValue(grid);

        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const actualSquareGrid = component.squareGrid.map((row: SquareView[]) => {
            return row.map((sv: SquareView) => sv.square);
        });
        expect(actualSquareGrid).toEqual(expectedGrid);
    });
});
