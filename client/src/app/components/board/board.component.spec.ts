/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { BoardNavigator } from '@app/classes/board-navigator/board-navigator';
import Direction from '@app/classes/board-navigator/direction';
import { Message } from '@app/classes/communication/message';
import { Orientation } from '@app/classes/orientation';
import { Square, SquareView } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { SquareComponent } from '@app/components/square/square.component';
import { BACKSPACE, ESCAPE, KEYDOWN } from '@app/constants/components-constants';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import { SQUARE_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { AppMaterialModule } from '@app/modules/material.module';
import { BoardService } from '@app/services';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BoardComponent } from './board.component';
import SpyObj = jasmine.SpyObj;

const OUT_OF_BOUNDS_POSITION = 999;

describe('BoardComponent', () => {
    let boardServiceSpy: SpyObj<BoardService>;
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;
    let getBoardServiceSquareSpy: jasmine.Spy;

    const BOARD_SERVICE_GRID_SIZE: Vec2 = { x: 5, y: 5 };
    const createGrid = (gridSize: Vec2): Square[][] => {
        const grid: Square[][] = [];
        for (let i = 0; i < gridSize.y; i++) {
            grid.push([]);
            for (let j = 0; j < gridSize.x; j++) {
                const mockSquare: Square = {
                    tile: null,
                    position: { row: i, column: j },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                };
                grid[i].push(mockSquare);
            }
        }
        return grid;
    };

    const boardSizesToTest = [
        [
            { x: -1, y: -1 },
            { x: 0, y: 0 },
        ],
        [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ],
        [
            { x: 15, y: 15 },
            { x: 15, y: 15 },
        ],
        [
            { x: 15, y: 10 },
            { x: 15, y: 10 },
        ],
    ];

    beforeEach(() => {
        boardServiceSpy = jasmine.createSpyObj(
            'BoardService',
            ['initializeBoard', 'subscribeToInitializeBoard', 'subscribeToBoardUpdate', 'updateBoard', 'readInitialBoard'],
            ['boardInitialization$', 'boardUpdateEvent$', 'initialBoard'],
        );

        const updateObs = new Subject<Square[]>();
        const initObs = new Subject<Square[][]>();

        boardServiceSpy.readInitialBoard.and.returnValue(createGrid(BOARD_SERVICE_GRID_SIZE));
        boardServiceSpy.subscribeToInitializeBoard.and.callFake((destroy$: Observable<boolean>, next: (board: Square[][]) => void) => {
            return initObs.pipe(takeUntil(destroy$)).subscribe(next);
        });
        boardServiceSpy.subscribeToBoardUpdate.and.callFake((destroy$: Observable<boolean>, next: (squaresToUpdate: Square[]) => void) => {
            return updateObs.pipe(takeUntil(destroy$)).subscribe(next);
        });
        boardServiceSpy.initializeBoard.and.callFake((board: Square[][]) => initObs.next(board));
        boardServiceSpy.updateBoard.and.callFake((squares: Square[]) => updateObs.next(squares));
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatGridListModule,
                MatCardModule,
                MatProgressSpinnerModule,
                MatIconModule,
                MatButtonModule,
                ReactiveFormsModule,
                CommonModule,
                MatInputModule,
                BrowserAnimationsModule,
                AppMaterialModule,
                MatFormFieldModule,
                FormsModule,
                MatDialogModule,
                RouterTestingModule,
                HttpClientTestingModule,
            ],
            declarations: [BoardComponent, SquareComponent],
            providers: [{ provide: BoardService, useValue: boardServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const grid: Square[][] = createGrid(BOARD_SERVICE_GRID_SIZE);
        getBoardServiceSquareSpy = spyOn<any>(component, 'getBoardServiceSquare').and.callFake((board: Square[][], row: number, column: number) => {
            return board[row][column];
        });
        component['initializeBoard'](grid);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('newMessage subscription', () => {
        it('should call handleNewMessage if gameViewEvent new message is defined', () => {
            const spy = spyOn<any>(component, 'handleNewMessage');
            component['gameViewEventManagerService'].emitGameViewEvent('newMessage', INITIAL_MESSAGE);
            expect(spy).toHaveBeenCalledWith(INITIAL_MESSAGE);
        });

        it('should NOT call handleNewMessage if gameViewEvent new message is undefined', () => {
            const spy = spyOn<any>(component, 'handleNewMessage');
            component['gameViewEventManagerService'].emitGameViewEvent('newMessage', null);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    it('Component should call initializeBoard on init if service has a board', () => {
        const initSpy = spyOn<any>(component, 'initializeBoard');
        component.ngOnInit();
        expect(initSpy).toHaveBeenCalled();
    });

    it('Component should NOT call initializeBoard on init if service has NO board', () => {
        boardServiceSpy.readInitialBoard.and.returnValue(undefined as unknown as Square[][]);
        const initSpy = spyOn<any>(component, 'initializeBoard');
        component.ngOnInit();
        expect(initSpy).not.toHaveBeenCalled();
    });

    boardSizesToTest.forEach((testCase) => {
        const boardSize: Vec2 = testCase[0];
        const expectedBoardSize: Vec2 = testCase[1];

        if (!expectedBoardSize) {
            return;
        }
        it(
            'Initializing board of size ' +
                boardSize.x +
                ' : ' +
                boardSize.y +
                ' should create board of size ' +
                expectedBoardSize.x +
                ' : ' +
                expectedBoardSize.y,
            () => {
                component.squareGrid = [];
                component.gridSize = { x: 0, y: 0 };
                const grid: Square[][] = createGrid(boardSize);
                getBoardServiceSquareSpy.and.callFake((board: Square[][], row: number, column: number) => {
                    return board[row][column];
                });

                component['initializeBoard'](grid);

                let actualRowAmount = 0;
                let actualColAmount = 0;

                if (component.squareGrid) {
                    actualRowAmount = component.squareGrid.length;
                    /*
                    If the Grid size is supposed to be smaller or equal to 0,
                    then each row of the grid will not be initialized.
                    So if the row is undefined, its length is 0
                    If the expected size is greater than 0, then the row length is defined
                */
                    actualColAmount = component.squareGrid[0] ? component.squareGrid[0].length : 0;
                }
                const actualBoardSize: Vec2 = { x: actualColAmount, y: actualRowAmount };
                expect(actualBoardSize).toEqual(expectedBoardSize);
            },
        );
    });

    it('Call to BoardService getGridSize should assign right value to gridSize', () => {
        expect(component.gridSize).toEqual(BOARD_SERVICE_GRID_SIZE);
    });

    it('If BoardService returns grid with null squares, should assign UNDEFINED_SQUARE to board', () => {
        const grid = [
            [UNDEFINED_SQUARE, null],
            [UNDEFINED_SQUARE, null],
        ];
        const expectedGrid = [
            [UNDEFINED_SQUARE, UNDEFINED_SQUARE],
            [UNDEFINED_SQUARE, UNDEFINED_SQUARE],
        ];
        getBoardServiceSquareSpy.and.callFake((board: Square[][], row: number, column: number) => {
            return board[row][column];
        });

        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component['initializeBoard'](grid as unknown as Square[][]);

        const actualSquareGrid = component.squareGrid.map((row: SquareView[]) => {
            return row.map((sv: SquareView) => sv.square);
        });
        expect(actualSquareGrid).toEqual(expectedGrid);
    });

    it('BoardService update event should update board', () => {
        const updateSpy = spyOn<any>(component, 'updateBoard');
        boardServiceSpy.updateBoard([component.squareGrid[0][0].square]);
        expect(updateSpy).toHaveBeenCalledWith([component.squareGrid[0][0].square]);
    });

    it('boardInitializationEvent should call initializeBoard', () => {
        const grid: Square[][] = createGrid(BOARD_SERVICE_GRID_SIZE);
        const initSpy = spyOn<any>(component, 'initializeBoard').and.callFake(() => {
            return;
        });
        boardServiceSpy.initializeBoard(grid);
        expect(initSpy).toHaveBeenCalled();
    });

    it('Update Board with no squares in argument should return false', () => {
        expect(component['updateBoard']([])).toBeFalsy();
    });

    it('Update Board with more squares that in the grid should return false', () => {
        const squaresToUpdate: Square[] = Array.from(Array(component.gridSize.x * component.gridSize.y + 1), () => UNDEFINED_SQUARE);
        expect(component['updateBoard'](squaresToUpdate)).toBeFalsy();
    });

    it('Update Board with with one square should only change that square', () => {
        const currentSquareView: SquareView = component.squareGrid[0][0];
        const squaresToUpdate: Square[] = [
            {
                tile: null,
                position: { row: 0, column: 0 },
                scoreMultiplier: null,
                wasMultiplierUsed: !currentSquareView.square.wasMultiplierUsed,
                isCenter: false,
            },
        ];
        component['updateBoard'](squaresToUpdate);
        expect(component.squareGrid[0][0].square).toEqual(squaresToUpdate[0]);
    });

    it('Update Board with with multiple squares should change all the squares', () => {
        const squaresToUpdate: Square[] = [
            {
                tile: null,
                position: { row: 0, column: 0 },
                scoreMultiplier: null,
                wasMultiplierUsed: true,
                isCenter: false,
            },
            {
                tile: null,
                position: { row: 1, column: 0 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: true,
            },
            {
                tile: { letter: 'A', value: 0 },
                position: { row: 0, column: 1 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ];
        component['updateBoard'](squaresToUpdate);
        expect(component.squareGrid[0][0].square).toEqual(squaresToUpdate[0]);
        expect(component.squareGrid[1][0].square).toEqual(squaresToUpdate[1]);
        expect(component.squareGrid[0][1].square).toEqual(squaresToUpdate[2]);
    });

    it('Update Board with with squares not in the board should not update the board', () => {
        const initBoard = [...component.squareGrid];
        const squaresToUpdate: Square[] = [
            {
                tile: null,
                position: { row: component.gridSize.x + 1, column: 0 },
                scoreMultiplier: null,
                wasMultiplierUsed: true,
                isCenter: false,
            },
            {
                tile: null,
                position: { row: 1, column: component.gridSize.y + 1 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: true,
            },
            {
                tile: { letter: 'A', value: 0 },
                position: { row: component.gridSize.x + 1, column: component.gridSize.y + 1 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            },
            {
                tile: { letter: 'Z', value: 1 },
                position: { row: -1, column: -1 },
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            },
        ];
        component['updateBoard'](squaresToUpdate);
        expect(component.squareGrid).toEqual(initBoard);
    });

    it('should call handlePlaceTiles on playingTiles', () => {
        const spy = spyOn<any>(component, 'handlePlaceTiles');
        component['gameViewEventManagerService'].emitGameViewEvent('tilesPlayed');
        expect(spy).toHaveBeenCalled();
    });

    describe('isInBounds', () => {
        it('return true if is in bound', () => {
            const position = { row: 0, column: 0 };
            expect(component['isInBounds'](position)).toBeTrue();
        });
        it('return false if is not in bound', () => {
            const position = { row: OUT_OF_BOUNDS_POSITION, column: OUT_OF_BOUNDS_POSITION };
            expect(component['isInBounds'](position)).toBeFalse();
        });
    });

    describe('handlePlaceTiles', () => {
        let payload: ActionPlacePayload;

        beforeEach(() => {
            payload = {
                tiles: [new Tile('A', 0), new Tile('B', 0)],
                orientation: Orientation.Horizontal,
                startPosition: { row: 0, column: 0 },
            };
        });

        it('should add squareView to notAppliedSquares', () => {
            component['handlePlaceTiles'](payload);

            expect(component['notAppliedSquares'].length).toEqual(payload.tiles.length);
        });

        it('should place tiles on grid', () => {
            component['handlePlaceTiles'](payload);

            for (let i = 0; i < payload.tiles.length; ++i) {
                expect(component.squareGrid[0][i].square.tile).toBeDefined();
                expect(component.squareGrid[0][i].square.tile!.letter).toEqual(payload.tiles[i].letter);
                expect(component.squareGrid[0][i].square.tile!.value).toEqual(payload.tiles[i].value);
                expect(component.squareGrid[0][i].applied).toBeFalse();
            }
        });

        it('should place tiles on grid', () => {
            payload.orientation = Orientation.Vertical;

            component['handlePlaceTiles'](payload);

            for (let i = 0; i < payload.tiles.length; ++i) {
                expect(component.squareGrid[i][0].square.tile).toBeDefined();
                expect(component.squareGrid[i][0].square.tile!.letter).toEqual(payload.tiles[i].letter);
                expect(component.squareGrid[i][0].square.tile!.value).toEqual(payload.tiles[i].value);
                expect(component.squareGrid[i][0].applied).toBeFalse();
            }
        });

        it('should not place tiles when position is out of bounds', () => {
            payload.startPosition.column = OUT_OF_BOUNDS_POSITION;

            component['handlePlaceTiles'](payload);

            expect(component.squareGrid[0].some((sv) => sv.square.tile !== null)).toBeFalse();
        });

        it('should not change tile if applied is true', () => {
            component.squareGrid[0][1].square.tile = new Tile('Z', 0);
            component.squareGrid[0][1].applied = true;

            component['handlePlaceTiles'](payload);

            expect(component.squareGrid[0][1].square.tile).toBeDefined();
            expect(component.squareGrid[0][1].square.tile!.letter).not.toEqual(payload.tiles[1].letter);
            expect(component.squareGrid[0][1].applied).toBeTrue();
        });

        it('should not change tile if applied is true', () => {
            component.squareGrid[0][0].square.tile = new Tile('Z', 0);

            component['handlePlaceTiles'](payload);

            expect(component.squareGrid[0][1].square.tile).toEqual(null);
        });
    });

    describe('handleNewMessage', () => {
        beforeEach(() => {
            (component['notAppliedSquares'] as unknown[]) = [{ square: { tile: 1 } }, { square: { tile: 2 } }];
        });

        it('should clear notAppliedSquares', () => {
            component['handleNewMessage']({ senderId: 'system-error' } as Message);
            expect(component['notAppliedSquares'].length).toEqual(0);
        });

        it('should remove tiles from notAppliedSquares', () => {
            component['handleNewMessage']({ senderId: 'system-error' } as Message);
            expect(component['notAppliedSquares'].every((s) => s.square.tile === null)).toBeTrue();
        });
    });

    describe('onFocusableEvent', () => {
        let selectedSquare: SquareView;
        let event: KeyboardEvent;
        let nextEmptySpy: jasmine.Spy;

        beforeEach(() => {
            selectedSquare = new SquareView(
                {
                    tile: null,
                    position: { row: 0, column: 0 },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                },
                {
                    x: 1,
                    y: 1,
                },
            );

            component.selectedSquare = selectedSquare;

            component.navigator = new BoardNavigator(component.squareGrid, { row: 0, column: 0 }, Orientation.Horizontal);

            event = new KeyboardEvent('exception');
            component.ngOnInit();

            nextEmptySpy = spyOn(component.navigator, 'nextEmpty').and.returnValue(undefined);
        });

        it('should set tile on selectedSquare', () => {
            component['onFocusableEvent']!(event);

            expect(selectedSquare.square.tile).not.toBeNull();
            expect(selectedSquare.applied).toBeFalse();
        });

        it('should add selectedSquare to notAppliedSquares', () => {
            component.notAppliedSquares = [];
            component['onFocusableEvent']!(event);

            expect(component.notAppliedSquares.includes(selectedSquare)).toBeTrue();
        });

        it('should call nextEmptySpy', () => {
            component['onFocusableEvent']!(event);
            expect(nextEmptySpy).toHaveBeenCalled();
        });

        it('should do nothing if selectedSquare is undefined', () => {
            component.selectedSquare = undefined;
            component.notAppliedSquares = [];

            component['onFocusableEvent']!(event);

            expect(nextEmptySpy).not.toHaveBeenCalled();
            expect(component.notAppliedSquares.length).toEqual(0);
        });

        describe('Backspace', () => {
            beforeEach(() => {
                event = { key: BACKSPACE, type: KEYDOWN } as unknown as KeyboardEvent;
            });

            it('should call nextEmpty with Backward if backspace', () => {
                component['onFocusableEvent']!(event);
                expect(nextEmptySpy).toHaveBeenCalledOnceWith(Direction.Backward, true);
            });

            it('should go back and remove tile (with notAppliedSquares)', () => {
                (selectedSquare.square.tile as unknown) = 'not null';
                nextEmptySpy.and.returnValue(selectedSquare);
                component.notAppliedSquares = [selectedSquare];

                component['onFocusableEvent']!(event);

                expect(component.notAppliedSquares.length).toEqual(0);
                expect(selectedSquare.square.tile).toBeNull();
            });

            it('should go back and remove tile', () => {
                (selectedSquare.square.tile as unknown) = 'not null';
                nextEmptySpy.and.returnValue(selectedSquare);

                component['onFocusableEvent']!(event);

                expect(selectedSquare.square.tile).toBeNull();
            });

            it('should do nothing if not keydown', () => {
                event = { key: BACKSPACE } as unknown as KeyboardEvent;
                (selectedSquare.square.tile as unknown) = 'not null';
                component['onFocusableEvent']!(event);
                expect(nextEmptySpy).not.toHaveBeenCalled();
            });

            it('should do nothing if selectedSquare is undefined', () => {
                component['selectedSquare'] = undefined;
                component['onFocusableEvent']!(event);
                expect(nextEmptySpy).not.toHaveBeenCalled();
            });
        });

        describe('Escape', () => {
            beforeEach(() => {
                event = { key: ESCAPE, type: KEYDOWN } as unknown as KeyboardEvent;
            });

            it('should clear selectedSquare', () => {
                (component.selectedSquare as unknown) = 'not-undefined';
                component['onFocusableEvent']!(event);
                expect(component.selectedSquare).toBeUndefined();
            });

            it('should call clearNotAppliedSquare', () => {
                const spy = spyOn<any>(component, 'clearNotAppliedSquare');
                component['onFocusableEvent']!(event);
                expect(spy).toHaveBeenCalled();
            });

            it('should do nothing if not keydown', () => {
                event = { key: ESCAPE } as unknown as KeyboardEvent;
                (component.selectedSquare as unknown) = 'not-undefined';
                component['onFocusableEvent']!(event);
                expect(component.selectedSquare).toBeDefined();
            });
        });
    });

    describe('onLooseFocusEvent', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should reset attributes', () => {
            (component.selectedSquare as unknown) = 'not-empty';

            component['onLoseFocusEvent']!();

            expect(component.selectedSquare).toBeUndefined();
        });

        it('should call clearNotAppliedSquare', () => {
            const spy = spyOn<any>(component, 'clearNotAppliedSquare');

            component['onLoseFocusEvent']!();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('onSquareClick', () => {
        let squareView: SquareView;
        let isLocalPlayerPlaying: jasmine.Spy;

        beforeEach(() => {
            squareView = new SquareView(
                {
                    tile: null,
                    position: { row: 0, column: 0 },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                },
                {
                    x: 1,
                    y: 0,
                },
            );

            isLocalPlayerPlaying = spyOn(component['gameService'], 'isLocalPlayerPlaying');
            isLocalPlayerPlaying.and.returnValue(true);
        });

        it('should set component as active keyboard component', () => {
            const spy = spyOn(component['focusableComponentService'], 'setActiveKeyboardComponent');

            component.onSquareClick(squareView);

            expect(spy).toHaveBeenCalledOnceWith(component);
        });

        it('should clear not applied square', () => {
            const spy = spyOn<any>(component, 'clearNotAppliedSquare');

            component.onSquareClick(squareView);

            expect(spy).toHaveBeenCalled();
        });

        it('should set selectedSquare is squareView is not selectedSquareView', () => {
            component.selectedSquare = undefined;

            component.onSquareClick(squareView);

            expect(component.selectedSquare as unknown as SquareView).toEqual(squareView);
        });

        it('should switch orientation if squareView is selectedSquare (horizontal)', () => {
            component.navigator.orientation = Orientation.Horizontal as Orientation;
            component.selectedSquare = squareView;

            component.onSquareClick(squareView);

            expect(component.navigator.orientation).toEqual(Orientation.Vertical);
        });

        it('should switch orientation if squareView is selectedSquare (vertical)', () => {
            component.navigator.orientation = Orientation.Vertical as Orientation;
            component.selectedSquare = squareView;

            component.onSquareClick(squareView);

            expect(component.navigator.orientation).toEqual(Orientation.Horizontal);
        });

        it('should do nothing if squareView has a tile', () => {
            (squareView.square.tile as unknown) = 'a tile';
            expect(component.onSquareClick(squareView)).toBeFalse();
        });

        it('should do nothing is localPlayerIsNotPlaying', () => {
            isLocalPlayerPlaying.and.returnValue(false);
            expect(component.onSquareClick(squareView)).toBeFalse();
        });
    });

    describe('isSamePosition', () => {
        let s1: SquareView;
        let s2: SquareView;

        beforeEach(() => {
            s1 = new SquareView(
                {
                    tile: null,
                    position: { row: 0, column: 0 },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                },
                {
                    x: 1,
                    y: 0,
                },
            );
            s2 = new SquareView(
                {
                    tile: null,
                    position: { row: 0, column: 0 },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                },
                {
                    x: 1,
                    y: 0,
                },
            );
        });

        it('should return false if undefined (both)', () => {
            expect(component.isSamePosition(undefined, undefined)).toBeFalse();
        });

        it('should return false if undefined (s1)', () => {
            expect(component.isSamePosition(undefined, s2)).toBeFalse();
        });

        it('should return false if undefined (s2)', () => {
            expect(component.isSamePosition(s1, undefined)).toBeFalse();
        });

        it('should return false if not same position', () => {
            s1.square.position = { row: 1, column: 1 };
            expect(component.isSamePosition(s1, s2)).toBeFalse();
        });

        it('should return true if same position', () => {
            expect(component.isSamePosition(s1, s2)).toBeTrue();
        });
    });

    describe('clearBitAppliedSquare', () => {
        it('should set all square tiles to null', () => {
            const baseSquareView = new SquareView(
                {
                    tile: {
                        letter: 'A',
                        value: 1,
                    },
                    position: { row: 1, column: 1 },
                    scoreMultiplier: null,
                    wasMultiplierUsed: false,
                    isCenter: false,
                },
                SQUARE_SIZE,
            );
            component['notAppliedSquares'] = [baseSquareView, baseSquareView, baseSquareView];

            component['clearNotAppliedSquare']();

            component['notAppliedSquares'].forEach((squareView) => expect(squareView.square.tile).toBeNull());
            expect(component['notAppliedSquares']).toEqual([]);
        });
    });
});
