import { Component, OnInit } from '@angular/core';
import { COLORS } from '@app/classes/color-constants';
import { BOARD_SIZE, GRID_MARGIN_LETTER, SQUARE_SIZE } from '@app/classes/game-constants';
import { Vec2 } from '@app/classes/vec2';
import { SquareView } from '@app/components/square/square-view';
import { BoardService } from '@app/services/board/board.service';

const MARGIN_COLUMN_SIZE = 1;
const ID_MULTIPLIER = 10000;

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
    colAmount: number;

    constructor(private boardService: BoardService) {
        this.marginLetters = GRID_MARGIN_LETTER;
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.gridSize = boardService.getGridSize();
    }

    ngOnInit() {
        this.initializeBoard();
        this.colAmount = BOARD_SIZE.x + MARGIN_COLUMN_SIZE;
    }

    private initializeBoard() {
        this.squareGrid = [];
        for (let i = 0; i < this.gridSize.y; i++) {
            this.squareGrid[i] = [];
            for (let j = 0; j < this.gridSize.x; j++) {
                const square: SquareView = {
                    square: null,
                    squareSize: SQUARE_SIZE,
                    color: COLORS.Beige,
                };
                this.squareGrid[i][j] = square;
            }
        }
    }
}
