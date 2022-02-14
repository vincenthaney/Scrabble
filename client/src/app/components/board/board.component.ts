import { Component, OnDestroy, OnInit } from '@angular/core';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { LETTER_VALUES, MARGIN_COLUMN_SIZE, SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { SQUARE_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size';
import { BoardService } from '@app/services/';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
    boardDestroyed$: Subject<boolean> = new Subject();
    marginLetters: LetterValue[];
    readonly marginColumnSize: number;
    gridSize: Vec2;
    squareGrid: SquareView[][];
    boardUpdateSubscription: Subscription;
    tileFontSize: number = SQUARE_TILE_DEFAULT_FONT_SIZE;

    constructor(private boardService: BoardService) {
        this.gridSize = { x: 0, y: 0 };
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
    }

    ngOnInit() {
        this.initializeBoard(this.boardService.initialBoard);
        this.boardUpdateSubscription = this.boardService.boardUpdateEvent
            .pipe(takeUntil(this.boardDestroyed$))
            .subscribe((squaresToUpdate: Square[]) => this.updateBoard(squaresToUpdate));
    }

    ngOnDestroy() {
        this.boardDestroyed$.next(true);
        this.boardDestroyed$.complete();
        this.boardUpdateSubscription.unsubscribe();
    }

    private initializeBoard(board: Square[][]) {
        if (!board || !board[0]) {
            this.gridSize = { x: 0, y: 0 };
            return;
        }

        this.gridSize = { x: board[0].length, y: board.length };
        this.squareGrid = [];
        for (let i = 0; i < this.gridSize.y; i++) {
            this.squareGrid[i] = [];
            for (let j = 0; j < this.gridSize.x; j++) {
                const square: Square = this.getBoardServiceSquare(board, i, j);
                const squareView: SquareView = new SquareView(square, SQUARE_SIZE);
                this.squareGrid[i][j] = squareView;
            }
        }
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
    }

    private getBoardServiceSquare(board: Square[][], row: number, column: number) {
        return board[row] && board[row][column] ? board[row][column] : UNDEFINED_SQUARE;
    }

    private updateBoard(squaresToUpdate: Square[]): boolean {
        if (!squaresToUpdate || squaresToUpdate.length <= 0 || squaresToUpdate.length > this.gridSize.x * this.gridSize.y) return false;

        /* 
            We flatten the 2D grid so it becomes a 1D array of SquareView
            Then, we check for each SquareView if it's square property's position 
            matches one of the square in "squareToUpate".
            If so, we change the board's square to be the updated square
        */
        ([] as SquareView[]).concat(...this.squareGrid).forEach((squareView: SquareView) => {
            squaresToUpdate
                .filter(
                    (square: Square) =>
                        square.position.row === squareView.square.position.row && square.position.column === squareView.square.position.column,
                )
                .map((sameSquare: Square) => (squareView.square = sameSquare));
        });
        return true;
    }
}
