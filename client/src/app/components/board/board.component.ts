import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';
import { Orientation } from '@app/classes/orientation';
import { Position } from '@app/classes/position';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { LETTER_VALUES, MARGIN_COLUMN_SIZE, SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { SQUARE_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size';
import { BoardService } from '@app/services/';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    boardInitializationSubscription: Subscription;
    notAppliedSquares: SquareView[];
    tileFontSize: number = SQUARE_TILE_DEFAULT_FONT_SIZE;

    private componentDestroyed$: Subject<boolean> = new Subject();

    constructor(private boardService: BoardService, private gameViewEventManagerService: GameViewEventManagerService) {
        this.gridSize = { x: 0, y: 0 };
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
        this.notAppliedSquares = [];
    }

    ngOnInit(): void {
        this.boardService.boardUpdateEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((squaresToUpdate: Square[]) => this.updateBoard(squaresToUpdate));
        this.boardService.boardInitializationEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((board: Square[][]) => this.initializeBoard(board));
        this.gameViewEventManagerService.subscribeToPlayingTiles(this.componentDestroyed$, (payload: ActionPlacePayload) =>
            this.handlePlaceTiles(payload),
        );
        this.gameViewEventManagerService.subscribeToMessages(this.componentDestroyed$, (message: Message) => this.handleNewMessage(message));

        if (!this.boardService.readInitialBoard()) return;
        this.initializeBoard(this.boardService.readInitialBoard());
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    private initializeBoard(board: Square[][]): void {
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

    private getBoardServiceSquare(board: Square[][], row: number, column: number): Square {
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
                .map((sameSquare: Square) => {
                    squareView.square = sameSquare;
                    squareView.applied = true;
                });
        });
        this.notAppliedSquares = [];
        return true;
    }

    private isInBounds(position: Position): boolean {
        return position.row < this.squareGrid.length && position.column < this.squareGrid[position.row].length;
    }

    private handlePlaceTiles(payload: ActionPlacePayload): void {
        const position = { ...payload.startPosition };
        const next = () => (payload.orientation === Orientation.Horizontal ? position.column++ : position.row++);

        for (let i = 0; i < payload.tiles.length; ) {
            if (!this.isInBounds(position)) return;

            const squareView = this.squareGrid[position.row][position.column];

            if (!squareView.square.tile) {
                squareView.square.tile = { ...payload.tiles[i] };
                squareView.applied = false;
                this.notAppliedSquares.push(squareView);
                i++;
            } else if (i === 0) {
                return;
            }

            next();
        }
    }

    private handleNewMessage(message: Message): void {
        if (message.senderId === 'system-error') {
            this.notAppliedSquares.forEach((square) => (square.square.tile = null));
            this.notAppliedSquares = [];
        }
    }
}
