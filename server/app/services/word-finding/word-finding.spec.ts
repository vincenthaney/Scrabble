/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
// import { WordFindingRequest } from '@app/classes/word-finding';
import { expect } from 'chai';
import { Container } from 'typedi';
import WordFindingService from './word-finding';
import * as chai from 'chai';

type LetterValues = (LetterValue | ' ')[][];

const BOARD: LetterValues = [
    [' ', ' ', ' ', 'D', ' ', ' '],
    [' ', ' ', 'A', ' ', ' ', ' '],
    [' ', ' ', 'B', ' ', ' ', ' '],
    [' ', ' ', 'C', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', 'E', ' '],
    [' ', ' ', ' ', ' ', 'E', ' '],
];

const DEFAULT_SQUARE_1: Square = { tile: null, position: new Position(0, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_2: Square = { tile: null, position: new Position(0, 1), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_3: Square = { tile: null, position: new Position(0, 2), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_4: Square = { tile: null, position: new Position(0, 3), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_ARRAY = [DEFAULT_SQUARE_1, DEFAULT_SQUARE_2, DEFAULT_SQUARE_3, DEFAULT_SQUARE_4];
// const OUT_OF_BOUNDS_POSITION: Position = new Position(999, 999);
// const OUT_OF_BOUNDS_ROW: Position = new Position(999, 0);
// const OUT_OF_BOUNDS_COLUMN: Position = new Position(0, 999);
// const SHOULD_BE_FILLED = true;
const DEFAULT_TILES_LEFT_SIZE = 7;
const DEFAULT_SMALL_TILES_LEFT_SIZE = 3;
const DEFAULT_ORIENTATION = Orientation.Horizontal;

const boardFromLetterValues = (letterValues: LetterValues) => {
    const grid: Square[][] = [];

    letterValues.forEach((line, row) => {
        const boardRow: Square[] = [];

        line.forEach((letter, column) => {
            boardRow.push({
                tile: letter === ' ' ? null : { letter: letter as LetterValue, value: 0 },
                position: new Position(row, column),
                scoreMultiplier: null,
                wasMultiplierUsed: false,
                isCenter: false,
            });
        });

        grid.push(boardRow);
    });

    return new Board(grid);
};

describe.only('WordFindingservice', () => {
    let board: Board;
    let navigator: BoardNavigator;
    let service: WordFindingService;

    beforeEach(() => {
        board = boardFromLetterValues(BOARD);
        navigator = new BoardNavigator(board, new Position(0, 0), DEFAULT_ORIENTATION);
    });

    beforeEach(() => {
        Container.reset();
        service = Container.get(WordFindingService);
    });

    it('should be created', () => {
        expect(service).to.exist;
    });

    describe('findMinimumWordLength', () => {
        it('should call navigator.moveUntil', () => {
            const spy = chai.spy.on(navigator, 'moveUntil', () => {
                return true;
            });
            service.findMinimumWordLength(navigator);
            expect(spy).to.have.been.called;
        });

        it('should return POSITIVE_INFINITY if there is no neighbour', () => {
            navigator = navigator.switchOrientation();
            expect(service.findMinimumWordLength(navigator)).to.equal(Number.POSITIVE_INFINITY);
        });

        it('should return the correct amount of tiles if there is a neighbor on the side', () => {
            navigator = new BoardNavigator(board, new Position(0, 1), Orientation.Horizontal);
            expect(service.findMinimumWordLength(navigator)).to.equal(2);
        });

        it('should return the correct amount of tiles if there is a neighbor on the path', () => {
            navigator = new BoardNavigator(board, new Position(1, 4), Orientation.Vertical);
            expect(service.findMinimumWordLength(navigator)).to.equal(3);
        });
    });

    describe('findMaximumWordTileLeftLength', () => {
        it('should call navigator.moveUntil', () => {
            const spy = chai.spy.on(navigator, 'moveUntil', () => {
                return true;
            });
            service.findMaximumWordTileLeftLength(navigator, DEFAULT_TILES_LEFT_SIZE);
            expect(spy).to.have.been.called;
        });

        it('should return 0 if there are enough empty Squares', () => {
            navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
            expect(service.findMaximumWordTileLeftLength(navigator, DEFAULT_SMALL_TILES_LEFT_SIZE)).to.equal(0);
        });

        it('should return the amount of empty Squares in the direction', () => {
            navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
            expect(service.findMaximumWordTileLeftLength(navigator, DEFAULT_TILES_LEFT_SIZE)).to.equal(
                DEFAULT_TILES_LEFT_SIZE - (board.getSize().x - 1),
            );
        });

        it('should return the amount of empty Squares in the direction', () => {
            navigator = new BoardNavigator(board, new Position(0, 2), Orientation.Vertical);
            expect(service.findMaximumWordTileLeftLength(navigator, DEFAULT_TILES_LEFT_SIZE)).to.equal(DEFAULT_TILES_LEFT_SIZE - 3);
        });

        it('should return the amount of empty Squares in the direction', () => {
            navigator = new BoardNavigator(board, new Position(2, 3), Orientation.Horizontal);
            expect(service.findMaximumWordTileLeftLength(navigator, DEFAULT_TILES_LEFT_SIZE)).to.equal(DEFAULT_TILES_LEFT_SIZE - 3);
        });
    });

    describe('findProperties', () => {
        it('should call findMinimumWordLength and findMaximumWordTileLeftLength', () => {
            const spyFindMinimumWordLength = chai.spy.on(service, 'findMinimumWordLength', () => {
                return 0;
            });
            const spyFindMaximumWordTileLeftLength = chai.spy.on(service, 'findMaximumWordTileLeftLength', () => {
                return 0;
            });
            service.findProperties(navigator, DEFAULT_TILES_LEFT_SIZE);
            expect(spyFindMinimumWordLength).to.have.been.called;
            expect(spyFindMaximumWordTileLeftLength).to.have.been.called;
        });

        it('should return isTried = true if findMinimumWordLength is POSITIVE_INFINITY ', () => {
            const spyFindMinimumWordLength = chai.spy.on(service, 'findMinimumWordLength', () => {
                return Number.POSITIVE_INFINITY;
            });
            const spyFindMaximumWordTileLeftLength = chai.spy.on(service, 'findMaximumWordTileLeftLength', () => {
                return 0;
            });
            expect(service.findProperties(navigator, DEFAULT_TILES_LEFT_SIZE).isTried).to.be.true;
            expect(spyFindMinimumWordLength).to.have.been.called;
            expect(spyFindMaximumWordTileLeftLength).not.to.have.been.called;
        });

        it('should return isTried = true if findMinimumWordLength is too big ', () => {
            const spyFindMinimumWordLength = chai.spy.on(service, 'findMinimumWordLength', () => {
                return DEFAULT_TILES_LEFT_SIZE + 1;
            });
            const spyFindMaximumWordTileLeftLength = chai.spy.on(service, 'findMaximumWordTileLeftLength', () => {
                return 0;
            });
            expect(service.findProperties(navigator, DEFAULT_TILES_LEFT_SIZE).isTried).to.be.true;
            expect(spyFindMinimumWordLength).to.have.been.called;
            expect(spyFindMaximumWordTileLeftLength).not.to.have.been.called;
        });

        it('should return the correct moveProperties ', () => {
            const minLength = 1;
            const maxLength = 4;
            const expected = { isTried: false, minimumLength: minLength, maximumLength: DEFAULT_TILES_LEFT_SIZE - maxLength };
            chai.spy.on(service, 'findMinimumWordLength', () => {
                return minLength;
            });
            const spyFindMaximumWordTileLeftLength = chai.spy.on(service, 'findMaximumWordTileLeftLength', () => {
                return maxLength;
            });
            expect(service.findProperties(navigator, DEFAULT_TILES_LEFT_SIZE)).to.deep.equal(expected);
            expect(spyFindMaximumWordTileLeftLength).to.have.been.called.with(navigator, DEFAULT_TILES_LEFT_SIZE - minLength);
        });
    });

    describe('getRandomSquare', () => {
        it('should remove 1 element form array and return it', () => {
            const arrayCopy: Square[] = JSON.parse(JSON.stringify(DEFAULT_SQUARE_ARRAY));
            const removedSquare = service.getRandomSquare(arrayCopy);
            console.log(arrayCopy);
            console.log(removedSquare);
            expect(arrayCopy.length).to.equal(DEFAULT_SQUARE_ARRAY.length - 1);
            expect(DEFAULT_SQUARE_ARRAY.some((square) => JSON.stringify(square) === JSON.stringify(removedSquare))).to.be.true;
            expect(arrayCopy.includes(removedSquare)).to.be.false;
        });
    });

    // it('should throw', () => {
    //     const result = () => service.findWords({} as unknown as Board, [] as unknown as Tile[], {} as unknown as WordFindingRequest);
    //     expect(result).to.throw();
    // });
});
