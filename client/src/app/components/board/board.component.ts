import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import Direction from '@app/classes/board-navigator/direction';
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
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy {
    readonly marginColumnSize: number;
    gridSize: Vec2;
    marginLetters: LetterValue[];
    squareGrid: SquareView[][];
    notAppliedSquares: SquareView[];
    tileFontSize: number;
    selectedSquare: SquareView | undefined;

    navigator: BoardNavigator;
    boardUpdateSubscription: Subscription;
    boardInitializationSubscription: Subscription;
    private componentDestroyed$: Subject<boolean>;

    constructor(
        private boardService: BoardService,
        private gameService: GameService,
        private gameViewEventManagerService: GameViewEventManagerService,
        private roundManagerService: RoundManagerService,
        private focusableComponentService: FocusableComponentsService,
    ) {
        super();
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.gridSize = { x: 0, y: 0 };
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
        this.squareGrid = [];
        this.notAppliedSquares = [];
        this.tileFontSize = SQUARE_TILE_DEFAULT_FONT_SIZE;
        this.selectedSquare = undefined;
        this.componentDestroyed$ = new Subject<boolean>();
    }

    ngOnInit(): void {
        this.boardService.subscribeToInitializeBoard(this.componentDestroyed$, (board: Square[][]) => this.initializeBoard(board));
        this.boardService.subscribeToBoardUpdate(this.componentDestroyed$, (squaresToUpdate: Square[]) => this.updateBoard(squaresToUpdate));
        this.gameViewEventManagerService.subscribeToGameViewEvent('usedTiles', this.componentDestroyed$, this.handlePlaceTiles.bind(this));
        this.roundManagerService.endRoundEvent.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => clearCursor());

        if (!this.boardService.readInitialBoard()) return;
        this.initializeBoard(this.boardService.readInitialBoard());

        this.navigator = new BoardNavigator(this.squareGrid, { row: 0, column: 0 }, Orientation.Horizontal);

        // This must be defined in the onInit, otherwise selectedSquare is undefined
        const clearCursor = (): void => {
            this.selectedSquare = undefined;
            this.clearNotAppliedSquare();
        };

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
        this.onFocusableEvent = (exception: KeyboardEvent): void => {
            switch (exception.key) {
                case BACKSPACE:
                    if (exception.type === KEYDOWN) handleBackspace();
                    break;
                case ESCAPE:
                    if (exception.type === KEYDOWN) clearCursor();
                    break;
                default:
                    handlePlaceLetter(exception.key, this.selectedSquare);
            }
        };

        // This must be defined in the onInit, otherwise selectedSquare is undefined
        this.onLoseFocusEvent = (): void => clearCursor();

        this.subscribeToFocusableEvent(this.componentDestroyed$, this.onFocusableEvent);
        this.subscribeToLoseFocusEvent(this.componentDestroyed$, this.onLoseFocusEvent);
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    onSquareClick(squareView: SquareView): boolean {
        this.focusableComponentService.setActiveKeyboardComponent(this);

        if (squareView.square.tile !== null) return false;
        if (!this.gameService.isLocalPlayerPlaying()) return false;

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

    private clearNotAppliedSquare(): void {
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
        if (this.hasBoardBeenUpdated(squaresToUpdate)) return false;
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

    private hasBoardBeenUpdated(squaresToUpdate: Square[]): boolean {
        return !squaresToUpdate || squaresToUpdate.length <= 0 || squaresToUpdate.length > this.gridSize.x * this.gridSize.y;
    }

    private isInBounds(position: Position): boolean {
        return position.row < this.squareGrid.length && position.column < this.squareGrid[position.row].length;
    }

    private clearUsedTiles(): void {
        this.notAppliedSquares.forEach((square) => (square.square.tile = null));
        this.notAppliedSquares = [];
    }

    private handlePlaceTiles(payload: ActionPlacePayload | undefined): void {
        if (!payload) {
            this.clearUsedTiles();
            return;
        }

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
}
