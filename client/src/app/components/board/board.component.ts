import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import Direction from '@app/classes/board-navigator/direction';
import { Message } from '@app/classes/communication/message';
import { Orientation } from '@app/classes/orientation';
import { Position } from '@app/classes/position';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { BACKSPACE, ESCAPE, KEYDOWN } from '@app/constants/components-constants';
import { LETTER_VALUES, MARGIN_COLUMN_SIZE, SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { SQUARE_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size';
import { BoardService, GameService } from '@app/services/';
import { FocusableComponent } from '@app/services/focusable-components/focusable-component';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy {
    boardDestroyed$: Subject<boolean> = new Subject();
    marginLetters: LetterValue[];
    readonly marginColumnSize: number;
    gridSize: Vec2;
    squareGrid: SquareView[][];
    boardUpdateSubscription: Subscription;
    boardInitializationSubscription: Subscription;
    notAppliedSquares: SquareView[];
    tileFontSize: number = SQUARE_TILE_DEFAULT_FONT_SIZE;

    navigator: BoardNavigator;
    selectedSquare: SquareView | undefined;

    constructor(
        private boardService: BoardService,
        private gameService: GameService,
        private roundManagerService: RoundManagerService,
        private focusableComponentService: FocusableComponentsService,
    ) {
        super();
        this.gridSize = { x: 0, y: 0 };
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
        this.notAppliedSquares = [];
    }

    ngOnInit(): void {
        this.initializeBoard(this.boardService.initialBoard);
        this.navigator = new BoardNavigator(this.squareGrid, { row: 0, column: 0 }, Orientation.Horizontal);

        // This must be defined in the onInit, otherwise selectedSquare is undefined
        const clearCursor = (): void => {
            this.selectedSquare = undefined;
            this.clearNotAppliedSquare();
        };

        this.boardUpdateSubscription = this.boardService.boardUpdateEvent
            .pipe(takeUntil(this.boardDestroyed$))
            .subscribe((squaresToUpdate: Square[]) => this.updateBoard(squaresToUpdate));
        this.boardInitializationSubscription = this.boardService.boardInitializationEvent
            .pipe(takeUntil(this.boardDestroyed$))
            .subscribe((board: Square[][]) => this.initializeBoard(board));
        this.gameService.playingTiles
            .pipe(takeUntil(this.boardDestroyed$))
            .subscribe((payload: ActionPlacePayload) => this.handlePlaceTiles(payload));
        this.gameService.newMessageValue.pipe(takeUntil(this.boardDestroyed$)).subscribe((message: Message) => this.handleNewMessage(message));
        this.roundManagerService.endRoundEvent.pipe(takeUntil(this.boardDestroyed$)).subscribe(() => clearCursor());

        // This must be defined in the onInit, otherwise selectedSquare is undefined
        const handleBackspace = (): void => {
            if (!this.selectedSquare) return;
            this.selectedSquare = this.navigator.nextEmpty(Direction.Backward, true);
            if (this.selectedSquare) {
                const index = this.notAppliedSquares.indexOf(this.selectedSquare);
                if (index >= 0) this.notAppliedSquares.splice(index, 1);
                this.selectedSquare.square.tile = null;
            }
        };
        // This must be defined in the onInit, otherwise selectedSquare is undefined
        const handlePlaceLetter = (letter: string, squareView: SquareView | undefined): void => {
            if (!squareView) return;
            squareView.square.tile = new Tile(letter.toUpperCase() as LetterValue, 0);
            squareView.applied = false;
            this.notAppliedSquares.push(squareView);
            this.selectedSquare = this.navigator.nextEmpty(Direction.Forward, false);
        };

        // This must be defined in the onInit, otherwise selectedSquare is undefined
        this.onFocusableEvent = (e: KeyboardEvent): void => {
            switch (e.key) {
                case BACKSPACE:
                    if (e.type === KEYDOWN) handleBackspace();
                    break;
                case ESCAPE:
                    if (e.type === KEYDOWN) clearCursor();
                    break;
                default:
                    handlePlaceLetter(e.key, this.selectedSquare);
            }
        };

        // This must be defined in the onInit, otherwise selectedSquare is undefined
        this.onLoseFocusEvent = (): void => clearCursor();

        this.subscribeToFocusableEvent(this.boardDestroyed$, this.onFocusableEvent);
        this.subscribeToLoseFocusEvent(this.boardDestroyed$, this.onLoseFocusEvent);
    }

    ngOnDestroy(): void {
        this.boardDestroyed$.next(true);
        this.boardDestroyed$.complete();
    }

    onSquareClick(squareView: SquareView): boolean {
        if (squareView.square.tile !== null) return false;
        if (!this.gameService.isLocalPlayerPlaying()) return false;

        this.focusableComponentService.setActiveKeyboardComponent(this);

        if (this.selectedSquare === squareView && this.notAppliedSquares.length === 0) {
            this.navigator.switchOrientation();
        } else {
            this.selectedSquare = squareView;
            this.navigator.orientation = Orientation.Horizontal;
            this.navigator.setPosition(squareView.square.position);
        }

        this.clearNotAppliedSquare();

        return true;
    }

    isSamePosition(s1: SquareView | undefined, s2: SquareView | undefined): boolean {
        return (
            s1 !== undefined &&
            s2 !== undefined &&
            s1.square.position.row === s2.square.position.row &&
            s1.square.position.column === s2.square.position.column
        );
    }

    private clearNotAppliedSquare() {
        this.notAppliedSquares.forEach((s) => (s.square.tile = null));
        this.notAppliedSquares = [];
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
        this.clearNotAppliedSquare();

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
        this.selectedSquare = undefined;
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
