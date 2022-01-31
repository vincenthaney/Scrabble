import { Component, OnInit } from '@angular/core';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { LETTER_VALUES, MARGIN_COLUMN_SIZE, SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { BoardService } from '@app/services/';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
    readonly marginLetters: LetterValue[];
    readonly marginColumnSize: number;
    gridSize: Vec2;
    squareGrid: SquareView[][];

    constructor(private boardService: BoardService) {
        this.marginColumnSize = MARGIN_COLUMN_SIZE;

        this.gridSize = this.boardService.getGridSize();
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
    }

    ngOnInit() {
        this.initializeBoard();
    }

    private initializeBoard() {
        this.squareGrid = [];
        for (let i = 0; i < this.gridSize.y; i++) {
            this.squareGrid[i] = [];
            for (let j = 0; j < this.gridSize.x; j++) {
                const square: Square = this.getBoardServiceSquare(i, j);
                const squareView: SquareView = new SquareView(square, SQUARE_SIZE);
                this.squareGrid[i][j] = squareView;
            }
        }
    }

    private getBoardServiceSquare(row: number, column: number) {
        const serviceGrid: Square[][] = this.boardService.grid;
        return serviceGrid[row] && serviceGrid[row][column] ? this.boardService.grid[row][column] : UNDEFINED_SQUARE;
    }
}
