import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { SquareComponent } from '@app/components/square/square.component';
import { LETTER_VALUES, MARGIN_COLUMN_SIZE, SQUARE_SIZE, TILE_MAX_FONT_SIZE, TILE_MIN_FONT_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { BoardService } from '@app/services/';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
    @ViewChildren('square') squareComponents: QueryList<SquareComponent>;
    marginLetters: LetterValue[];
    readonly marginColumnSize: number;
    gridSize: Vec2;
    squareGrid: SquareView[][];
    boardUpdateSubscription: Subscription;

    constructor(private boardService: BoardService) {
        this.gridSize = { x: 0, y: 0 };
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
    }

    changeFontSize(operation: string) {
        if (operation === 'smaller') {
            this.squareComponents.forEach((squareComponent) => {
                if (squareComponent.tileFontSize > TILE_MIN_FONT_SIZE) squareComponent.tileFontSize -= 0.1;
            });
        } else if (operation === 'larger') {
            this.squareComponents.forEach((squareComponent) => {
                if (squareComponent.tileFontSize < TILE_MAX_FONT_SIZE) squareComponent.tileFontSize += 0.1;
            });
        }
    }

    ngOnInit() {
        this.initializeBoard(this.boardService.initialBoard);
        this.boardUpdateSubscription = this.boardService.boardUpdateEvent.subscribe((squaresToUpdate: Square[]) => this.updateBoard(squaresToUpdate));
    }

    ngOnDestroy() {
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
