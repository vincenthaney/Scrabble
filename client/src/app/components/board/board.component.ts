import { Component, OnInit } from '@angular/core';
import { SquareView } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { LETTER_VALUES, MARGIN_COLUMN_SIZE, SQUARE_SIZE, UNDEFINED_GRID_SIZE } from '@app/constants/game';
import { BoardService } from '@app/services/';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
    readonly marginLetters;
    readonly marginColumnSize: number;
    gridSize: Vec2;
    squareGrid: SquareView[][];

    constructor(private boardService: BoardService) {
        this.marginColumnSize = MARGIN_COLUMN_SIZE;

        this.gridSize = this.boardService.getGridSize();
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
        if (!this.gridSize) {
            this.gridSize = UNDEFINED_GRID_SIZE;
        }
    }

    ngOnInit() {
        this.initializeBoard();
    }

    private initializeBoard() {
        this.squareGrid = [];
        for (let i = 0; i < this.gridSize.y; i++) {
            this.squareGrid[i] = [];
            for (let j = 0; j < this.gridSize.x; j++) {
                const square = this.boardService.grid && this.boardService.grid[i] ? this.boardService.grid[i][j] : null;
                const squareView: SquareView = new SquareView(square, SQUARE_SIZE);
                this.squareGrid[i][j] = squareView;
            }
        }
    }
}
