import { Component, OnDestroy, OnInit } from '@angular/core';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { LETTER_VALUES, MARGIN_COLUMN_SIZE, SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { BoardService } from '@app/services/';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
    marginLetters: LetterValue[];
    readonly marginColumnSize: number;
    gridSize: Vec2;
    squareGrid: SquareView[][];
    boardUpdateSubscription: Subscription;

    constructor(private boardService: BoardService) {
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
    }

    ngOnInit() {
        this.boardUpdateSubscription = this.boardService.boardUpdateEvent.subscribe((board: Square[][]) => this.renderBoard(board));
    }

    ngOnDestroy() {
        this.boardUpdateSubscription.unsubscribe();
    }

    private renderBoard(board: Square[][]) {
        if (!board || !board[0]) {
            this.gridSize = { x: 0, y: 0 };
            return;
        }

        this.gridSize = { x: board.length, y: board[0].length };
        this.squareGrid = [];
        for (let i = 0; i < this.gridSize.y; i++) {
            this.squareGrid[i] = [];
            for (let j = 0; j < this.gridSize.x; j++) {
                const square: Square = this.getBoardServiceSquare(board, i, j);
                const squareView: SquareView = new SquareView(square, SQUARE_SIZE);
                this.squareGrid[i][j] = squareView;
            }
        }
    }

    private getBoardServiceSquare(board: Square[][], row: number, column: number) {
        return board[row] && board[row][column] ? board[row][column] : UNDEFINED_SQUARE;
    }
}
