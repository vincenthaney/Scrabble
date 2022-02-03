/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { UNDEFINED_SQUARE } from '@app/constants/game';
import { AppMaterialModule } from '@app/modules/material.module';
import { BoardService } from '@app/services';
import { BoardComponent } from './board.component';

class MockBoardService {
    static boardServiceGridSize: Vec2 = { x: 5, y: 5 };
    pGrid: Square[][];

    constructor() {
        this.grid = [];
        for (let i = 0; i < this.getGridSize().y; i++) {
            this.grid.push([]);
            for (let j = 0; j < this.getGridSize().x; j++) {
                const mockSquare: Square = {
                    tile: null,
                    position: { row: i, column: j },
                    multiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                };
                this.grid[i].push(mockSquare);
            }
        }
    }

    get grid(): Square[][] {
        return this.pGrid;
    }
    set grid(grid: Square[][]) {
        this.pGrid = grid;
    }

    getGridSize(): Vec2 {
        return MockBoardService.boardServiceGridSize;
    }
}

describe('BoardComponent', () => {
    let mockBoardService: MockBoardService;
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;

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

    beforeEach(() => {
        mockBoardService = new MockBoardService();
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
            providers: [{ provide: BoardService, useValue: mockBoardService }, MockBoardService],
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
        const boardSize: Vec2 = testCase[0];
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
                spyOn<any>(mockBoardService, 'getGridSize').and.returnValue(boardSize);

                // Recreate the component so it reads the new grid size
                fixture = TestBed.createComponent(BoardComponent);
                component = fixture.componentInstance;
                fixture.detectChanges();

                component['initializeBoard']();

                const actualRowAmount = component.squareGrid.length;

                /*
                    If the Grid size is supposed to be smaller or equal to 0,
                    then each row of the grid will not be initialized.
                    So if the row is undefined, its length is 0
                    If the expected size is greater than 0, then the row length is defined
                */
                const actualColAmount = component.squareGrid[0] ? component.squareGrid[0].length : 0;

                const actualBoardSize: Vec2 = { x: actualColAmount, y: actualRowAmount };
                expect(actualBoardSize).toEqual(expectedBoardSize);
            },
        );
    });

    it('Call to BoardService getGridSize should assign right value to gridSize', () => {
        expect(component.gridSize).toEqual(mockBoardService.getGridSize());
    });

    it('If BoardService returns grid with null squares, should assign UNDEFINED_SQUARE to board', () => {
        const grid = [
            [MockBoardService.mockSquare, null],
            [MockBoardService.mockSquare, null],
        ];
        const expectedGrid = [
            [MockBoardService.mockSquare, UNDEFINED_SQUARE],
            [MockBoardService.mockSquare, UNDEFINED_SQUARE],
        ];
        spyOn<any>(mockBoardService, 'getGridSize').and.returnValue({ x: 2, y: 2 });

        // We need to spy on the property otherwise we cannot return a grid with null
        // values because of TypeScript's type enforcing
        spyOnProperty(mockBoardService, 'grid', 'get').and.returnValue(grid);

        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const actualSquareGrid = component.squareGrid.map((row: SquareView[]) => {
            return row.map((sv: SquareView) => sv.square);
        });
        expect(actualSquareGrid).toEqual(expectedGrid);
    });
});
