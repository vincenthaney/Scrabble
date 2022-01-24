import { Component } from '@angular/core';
import { Board } from '@app/classes/board';
import { COLORS } from '@app/classes/color-constants';
import { BOARD_SIZE, SQUARE_SIZE } from '@app/classes/game-constants';
import { Vec2 } from '@app/classes/vec2';
import { SquareView } from '@app/components/square/square-view';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
    readonly boardSize: Vec2 = BOARD_SIZE;
    readonly marginColumnAmount = 2;
    squares: SquareView[][];

    constructor() {
        this.squares = [];
        for (let i = 0; i < Board.size.x; i++) {
            this.squares[i] = [];
            for (let j = 0; j < Board.size.y; j++) {
                const square: SquareView = {
                    square: null,
                    squareSize: SQUARE_SIZE,
                    squarePosition: { x: i, y: j },
                    color: COLORS.Beige,
                    id: Math.floor(Math.random() * 1000),
                };
                this.squares[i][j] = square;
            }
        }
    }
}
