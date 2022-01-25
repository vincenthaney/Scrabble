import { Component, OnInit } from '@angular/core';
import { Board } from '@app/classes/board';
import { COLORS } from '@app/classes/color-constants';
import { BOARD_SIZE, GRID_MARGIN_LETTER, SQUARE_SIZE } from '@app/classes/game-constants';
import { SquareView } from '@app/components/square/square-view';

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
    squares: SquareView[][];
    colAmount: number;
    ngOnInit() {
        this.squares = [];
        for (let i = 0; i < Board.size.x; i++) {
            this.squares[i] = [];
            for (let j = 0; j < Board.size.y; j++) {
                const square: SquareView = {
                    square: null,
                    squareSize: SQUARE_SIZE,
                    squarePosition: { x: i, y: j },
                    color: COLORS.Beige,
                    id: Math.floor(Math.random() * ID_MULTIPLIER),
                };
                this.squares[i][j] = square;
            }
        }
        this.colAmount = BOARD_SIZE.x + MARGIN_COLUMN_SIZE;
    }
}
