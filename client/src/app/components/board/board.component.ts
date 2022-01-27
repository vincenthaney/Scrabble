import { Component, OnInit } from '@angular/core';
import { COLORS } from '@app/classes/color-constants';
import { GRID_MARGIN_LETTER, MARGIN_COLUMN_SIZE, SQUARE_SIZE, UNDEFINED_GRID_SIZE } from '@app/classes/game-constants';
import { Vec2 } from '@app/classes/vec2';
import { SquareView } from '@app/components/square/square-view';
import { BoardService } from '@app/services/';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
    readonly marginLetters = GRID_MARGIN_LETTER;
    readonly marginColumnSize: number = MARGIN_COLUMN_SIZE;
    gridSize: Vec2;
    squareGrid: SquareView[][];
    colorGrid: COLORS[][];
    colAmount: number;

    constructor(private boardService: BoardService) {
        this.marginLetters = GRID_MARGIN_LETTER;
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.gridSize = this.boardService.getGridSize();
    }

    ngOnInit() {
        this.initializeBoard();
        this.colAmount = this.gridSize.x + MARGIN_COLUMN_SIZE;
    }

    private initializeBoard() {
        if (!this.gridSize) {
            this.gridSize = UNDEFINED_GRID_SIZE;
        }
        this.squareGrid = [];
        this.colorGrid = [];
        for (let i = 0; i < this.gridSize.y; i++) {
            this.colorGrid[i] = [];
            this.squareGrid[i] = [];
            for (let j = 0; j < this.gridSize.x; j++) {
                this.colorGrid[i][j] = COLORS.Beige;
                const square = this.boardService.grid && this.boardService.grid[i] ? this.boardService.grid[i][j] : null;
                const squareView: SquareView = {
                    square,
                    squareSize: SQUARE_SIZE,
                    color: this.colorGrid[i][j],
                };
                this.squareGrid[i][j] = squareView;
            }
        }
    }
}
