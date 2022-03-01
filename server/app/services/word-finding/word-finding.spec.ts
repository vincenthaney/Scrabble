/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { expect } from 'chai';
import { Container } from 'typedi';
import WordFindingService from './word-finding';
import * as chai from 'chai';
import { stub, useFakeTimers } from 'sinon';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { StringConversion } from '@app/utils/string-conversion';
import { assert } from 'console';
import { WordFindingRequest } from '@app/classes/word-finding';
import { Random } from '@app/utils/random';
import { NO_REQUEST_POINT_HISTORIC, NO_REQUEST_POINT_RANGE } from '@app/constants/services-errors';
import { LONG_MOVE_TIME, FINAL_COMPUTE_TIME } from '@app/constants/services-constants/word-finding.const';
import { EvaluatedPlacement } from '@app/classes/word-finding/word-placement';

type LetterValues = (LetterValue | ' ')[][];

const BOARD: LetterValues = [
    [' ', ' ', ' ', 'D', ' ', ' '],
    [' ', ' ', 'A', ' ', ' ', ' '],
    [' ', ' ', 'B', ' ', ' ', ' '],
    [' ', ' ', 'C', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', 'E', ' '],
    [' ', ' ', ' ', ' ', 'E', ' '],
];

const DEFAULT_TILE_A: Tile = { letter: 'A', value: 1 };
// const DEFAULT_TILE_A_2: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 2 };
const DEFAULT_TILE_C: Tile = { letter: 'C', value: 3 };
const DEFAULT_TILE_D: Tile = { letter: 'D', value: 4 };
const DEFAULT_TILE_E: Tile = { letter: 'E', value: 5 };
const DEFAULT_TILE_F: Tile = { letter: 'F', value: 6 };
const DEFAULT_TILE_G: Tile = { letter: 'G', value: 7 };
// const DEFAULT_TILE_WILD: Tile = { letter: '*', value: 0 };
const EMPTY_TILE_RACK: Tile[] = [];
const SINGLE_TILE_TILE_RACK = [DEFAULT_TILE_A];
const SMALL_TILE_RACK = [DEFAULT_TILE_A, DEFAULT_TILE_B, DEFAULT_TILE_C];
const BIG_TILE_RACK = [DEFAULT_TILE_A, DEFAULT_TILE_B, DEFAULT_TILE_C, DEFAULT_TILE_D, DEFAULT_TILE_E, DEFAULT_TILE_F, DEFAULT_TILE_G];
// const REPEATING_TILE_RACK = [DEFAULT_TILE_A, DEFAULT_TILE_A_2, DEFAULT_TILE_B, DEFAULT_TILE_C];

const DEFAULT_SQUARE_1: Square = { tile: null, position: new Position(0, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_2: Square = { tile: null, position: new Position(0, 1), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_3: Square = { tile: null, position: new Position(0, 2), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_4: Square = { tile: null, position: new Position(0, 3), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_ARRAY = [DEFAULT_SQUARE_1, DEFAULT_SQUARE_2, DEFAULT_SQUARE_3, DEFAULT_SQUARE_4];
const DEFAULT_TILES_LEFT_SIZE = 7;
const DEFAULT_SMALL_TILES_LEFT_SIZE = 3;
const DEFAULT_ORIENTATION = Orientation.Horizontal;

const DEFAULT_HORIZONTAL_PROPERTIES = { isTried: false, minimumLength: 1, maximumLength: 2 };
const DEFAULT_VERTICAL_PROPERTIES = { isTried: false, minimumLength: 1, maximumLength: 3 };
const DEFAULT_SQUARE_PROPERTIES = {
    square: DEFAULT_SQUARE_1,
    horizontal: DEFAULT_HORIZONTAL_PROPERTIES,
    vertical: DEFAULT_VERTICAL_PROPERTIES,
    isEmpty: true,
};

/* eslint-disable @typescript-eslint/no-magic-numbers */
const DEFAULT_HISTORIC = new Map<number, number>([
    [1, 1],
    [2, 2],
    [4, 1],
    [8, 2],
    [15, 3],
]);
/* eslint-enable @typescript-eslint/no-magic-numbers */

const DEFAULT_REQUEST: WordFindingRequest = {
    pointRange: { minimum: 2, maximum: 8 },
    numberOfWordsToFind: 1,
    pointHistoric: DEFAULT_HISTORIC,
    maximiseScore: false,
};

const BEST_MOVE = {
    tilesToPlace: SMALL_TILE_RACK,
    orientation: Orientation.Horizontal,
    startPosition: DEFAULT_SQUARE_2.position,
    score: 15,
};

const DEFAULT_MOVE_4 = {
    tilesToPlace: SMALL_TILE_RACK,
    orientation: Orientation.Horizontal,
    startPosition: DEFAULT_SQUARE_2.position,
    score: 4,
};

const DEFAULT_MOVE_2 = {
    tilesToPlace: SINGLE_TILE_TILE_RACK,
    orientation: Orientation.Horizontal,
    startPosition: DEFAULT_SQUARE_1.position,
    score: 2,
};

const DEFAULT_MOVE_3 = {
    tilesToPlace: SINGLE_TILE_TILE_RACK,
    orientation: Orientation.Horizontal,
    startPosition: DEFAULT_SQUARE_3.position,
    score: 3,
};

const SINGLE_VALID_MOVES: EvaluatedPlacement[] = [DEFAULT_MOVE_4];

const DEFAULT_VALID_MOVES: EvaluatedPlacement[] = [DEFAULT_MOVE_2, BEST_MOVE, DEFAULT_MOVE_3, DEFAULT_MOVE_4, DEFAULT_MOVE_4, DEFAULT_MOVE_2];

const permutationAmount = (total: number, wanted: number) => {
    return factorial(total) / factorial(total - wanted);
};

const factorial = (number: number) => {
    let answer = 1;
    if (number === 0 || number === 1) {
        return answer;
    } else {
        for (let i = number; i >= 1; i--) {
            answer = answer * i;
        }
        return answer;
    }
};

const boardFromLetterValues = (letterValues: LetterValues) => {
    const grid: Square[][] = [];

    letterValues.forEach((line, row) => {
        const boardRow: Square[] = [];

        line.forEach((letter, column) => {
            boardRow.push({
                tile: letter === ' ' ? null : { letter: letter as LetterValue, value: 1 },
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

describe('WordFindingservice', () => {
    let board: Board;
    let navigator: BoardNavigator;
    let service: WordFindingService;

    beforeEach(() => {
        board = boardFromLetterValues(BOARD);
        navigator = new BoardNavigator(board, new Position(0, 0), DEFAULT_ORIENTATION);
        service = Container.get(WordFindingService);
    });

    afterEach(() => {
        Container.reset();
    });

    it('should be created', () => {
        expect(service).to.exist;
    });

    describe('findWords', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });
        it('should call the correct functions', () => {
            const spyGetRackPermutations = chai.spy.on(service, 'getRackPermutations', () => {
                return [SMALL_TILE_RACK, SINGLE_TILE_TILE_RACK];
            });
            const spyGetDesiredSquares = chai.spy.on(service, 'getDesiredSquares', () => {
                return DEFAULT_SQUARE_ARRAY;
            });
            const spyGetRandomSquare = chai.spy.on(service, 'getRandomSquare');
            const spyFindSquareProperties = chai.spy.on(service, 'findSquareProperties');
            const spyAttemptMove = chai.spy.on(service, 'attemptMove');
            const spyChooseMove = chai.spy.on(service, 'chooseMove');

            service.findWords(board, BIG_TILE_RACK, request);
            expect(spyGetRackPermutations).to.have.been.called;
            expect(spyGetDesiredSquares).to.have.been.called;
            expect(spyGetRandomSquare).to.have.been.called;
            expect(spyFindSquareProperties).to.have.been.called;
            expect(spyAttemptMove).to.have.been.called;
            expect(spyChooseMove).to.have.been.called;
        });

        it('should set timeOver to true and stop processing when timeout ', () => {
            const clock = useFakeTimers();
            const spyGetRackPermutations = chai.spy.on(service, 'getRackPermutations', () => {
                clock.tick(LONG_MOVE_TIME - FINAL_COMPUTE_TIME);
                return [SMALL_TILE_RACK, SINGLE_TILE_TILE_RACK];
            });
            const spyGetDesiredSquares = chai.spy.on(service, 'getDesiredSquares', () => {
                return DEFAULT_SQUARE_ARRAY;
            });
            const spyGetRandomSquare = chai.spy.on(service, 'getRandomSquare');
            const spyFindSquareProperties = chai.spy.on(service, 'findSquareProperties');
            const spyAttemptMove = chai.spy.on(service, 'attemptMove');
            const spyChooseMove = chai.spy.on(service, 'chooseMove');

            service.findWords(board, BIG_TILE_RACK, request);
            expect(spyGetRackPermutations).to.have.been.called;
            expect(spyGetDesiredSquares).to.have.been.called;
            expect(spyGetRandomSquare).not.to.have.been.called;
            expect(spyFindSquareProperties).not.to.have.been.called;
            expect(spyAttemptMove).not.to.have.been.called;
            expect(spyChooseMove).to.have.been.called;

            clock.restore();
        });
    });

    describe('attemptMoveDirection', () => {
        beforeEach(() => {
            // eslint-disable-next-line dot-notation
            service['wordExtraction'] = new WordExtraction(board);
        });

        it('should call the correct functions', () => {
            const spyGetCorrespondingMovePossibility = chai.spy.on(service, 'getCorrespondingMovePossibility', () => {
                return DEFAULT_SQUARE_PROPERTIES.horizontal;
            });
            const spyIsWithin = chai.spy.on(service, 'isWithin', () => {
                return true;
            });

            const stubWordToString = stub(StringConversion, 'wordToString');
            // eslint-disable-next-line dot-notation
            const spyExtract = chai.spy.on(service['wordExtraction'], 'extract');
            // eslint-disable-next-line dot-notation
            const spyVerifyWords = chai.spy.on(service['wordVerification'], 'verifyWords');

            service.attemptMoveDirection(DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, Orientation.Horizontal);
            expect(spyGetCorrespondingMovePossibility).to.have.been.called;
            expect(spyIsWithin).to.have.been.called;
            assert(stubWordToString.calledOnce);
            expect(spyExtract).to.have.been.called;
            expect(spyVerifyWords).to.have.been.called;
            stubWordToString.restore();
        });

        it('should return undefined if an error is thrown', () => {
            chai.spy.on(service, 'getCorrespondingMovePossibility', () => {
                return DEFAULT_SQUARE_PROPERTIES.horizontal;
            });
            chai.spy.on(service, 'isWithin', () => {
                return true;
            });
            // eslint-disable-next-line dot-notation
            chai.spy.on(service['wordExtraction'], 'extract', () => {
                throw new Error();
            });

            expect(service.attemptMoveDirection(DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, Orientation.Horizontal)).to.be.undefined;
        });

        it('should return undefined if it isnt within the possible range', () => {
            chai.spy.on(service, 'getCorrespondingMovePossibility', () => {
                return DEFAULT_SQUARE_PROPERTIES.horizontal;
            });
            chai.spy.on(service, 'isWithin', () => {
                return false;
            });
            expect(service.attemptMoveDirection(DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, Orientation.Horizontal)).to.be.undefined;
        });

        it('should return the current permutation as a WordPlacement if everything succeeds', () => {
            chai.spy.on(service, 'getCorrespondingMovePossibility', () => {
                return DEFAULT_SQUARE_PROPERTIES.horizontal;
            });
            chai.spy.on(service, 'isWithin', () => {
                return true;
            });
            const stubWordToString = stub(StringConversion, 'wordToString').returns(['']);

            // eslint-disable-next-line dot-notation
            chai.spy.on(service['wordExtraction'], 'extract');
            // eslint-disable-next-line dot-notation
            chai.spy.on(service['wordVerification'], 'verifyWords');
            const expected = {
                tilesToPlace: SMALL_TILE_RACK,
                orientation: Orientation.Horizontal,
                startPosition: DEFAULT_SQUARE_PROPERTIES.square.position,
                score: 13,
            };

            expect(service.attemptMoveDirection(DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, Orientation.Horizontal)).to.deep.equal(expected);
            stubWordToString.restore();
        });
    });

    describe('chooseMove', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should return all validMoves if the query asks for more than there is', () => {
            request.numberOfWordsToFind = SINGLE_VALID_MOVES.length + 1;
            expect(service.chooseMove(SINGLE_VALID_MOVES, request)).to.deep.equal(SINGLE_VALID_MOVES);
        });

        it('should return the best move if maximizeScore', () => {
            request.maximiseScore = true;
            expect(service.chooseMove(DEFAULT_VALID_MOVES, request)).to.deep.equal([BEST_MOVE]);
        });

        it('should call getRandomElementsFromArray if query has  no pointHistoric', () => {
            request.pointHistoric = undefined;
            const stubGetRandomElementsFromArray = stub(Random, 'getRandomElementsFromArray');
            service.chooseMove(DEFAULT_VALID_MOVES, request);
            assert(stubGetRandomElementsFromArray.calledOnce);
            stubGetRandomElementsFromArray.restore();
        });

        it('should call getRandomElementsFromArray if query has no pointRange ', () => {
            request.pointRange = undefined;
            const stubGetRandomElementsFromArray = stub(Random, 'getRandomElementsFromArray');
            service.chooseMove(DEFAULT_VALID_MOVES, request);
            assert(stubGetRandomElementsFromArray.calledOnce);
            stubGetRandomElementsFromArray.restore();
        });

        it('should call getMovesInRange and  selectLowestFrequencyScoreMove if there is a pointRange and a pointHistoric  ', () => {
            const stubGetMovesInRange = stub(service, 'getMovesInRange').returns({} as unknown as Map<number, EvaluatedPlacement>);
            const stubSelectLowestFrequencyScoreMove = stub(service, 'selectLowestFrequencyScoreMove');
            service.chooseMove(DEFAULT_VALID_MOVES, request);
            assert(stubGetMovesInRange.calledOnce);
            assert(stubSelectLowestFrequencyScoreMove.calledOnce);
        });
    });

    describe('getMovesInRange', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should throw if there is no pointRange', () => {
            request.pointRange = undefined;
            const result = () => service.getMovesInRange(SINGLE_VALID_MOVES, request);
            expect(result).to.Throw(NO_REQUEST_POINT_RANGE);
        });

        it('should return a map containing 1 of each score ', () => {
            const expected: Map<number, EvaluatedPlacement> = new Map([
                [DEFAULT_MOVE_2.score, DEFAULT_MOVE_2],
                [DEFAULT_MOVE_3.score, DEFAULT_MOVE_3],
                [DEFAULT_MOVE_4.score, DEFAULT_MOVE_4],
            ]);
            expect(service.getMovesInRange(DEFAULT_VALID_MOVES, request)).to.deep.equal(expected);
        });
    });

    describe('selectLowestFrequencyScoreMove', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should throw if there is no pointHistoric', () => {
            const foundMovesMap = new Map();
            request.pointHistoric = undefined;
            const result = () => service.selectLowestFrequencyScoreMove(foundMovesMap, request);
            expect(result).to.Throw(NO_REQUEST_POINT_HISTORIC);
        });

        it('should return the first move with a score that was never played ', () => {
            const foundMovesMap: Map<number, EvaluatedPlacement> = new Map([
                [DEFAULT_MOVE_2.score, DEFAULT_MOVE_2],
                [DEFAULT_MOVE_3.score, DEFAULT_MOVE_3],
                [DEFAULT_MOVE_4.score, DEFAULT_MOVE_4],
            ]);
            expect(service.selectLowestFrequencyScoreMove(foundMovesMap, request)).to.deep.equal(DEFAULT_MOVE_3);
        });

        it('should return the move with the lowest frequency amongst scores that were alreayd played', () => {
            const foundMovesMap: Map<number, EvaluatedPlacement> = new Map([
                [DEFAULT_MOVE_2.score, DEFAULT_MOVE_2],
                [DEFAULT_MOVE_4.score, DEFAULT_MOVE_4],
                [BEST_MOVE.score, BEST_MOVE],
            ]);
            expect(service.selectLowestFrequencyScoreMove(foundMovesMap, request)).to.deep.equal(DEFAULT_MOVE_4);
        });
    });

    describe('attemptMove', () => {
        it('should call attemptMoveDirection', () => {
            const stubAttemptMoveDirection = stub(service, 'attemptMoveDirection').returns(undefined);
            const validMoves: EvaluatedPlacement[] = [];
            service.attemptMove(DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, validMoves);
            assert(stubAttemptMoveDirection.calledTwice);
        });

        it('should add the EvaluatedPlacement that are valid (0)', () => {
            const stubAttemptMoveDirection = stub(service, 'attemptMoveDirection');
            stubAttemptMoveDirection.onCall(0).returns({} as unknown as EvaluatedPlacement);
            stubAttemptMoveDirection.onCall(1).returns(undefined);
            const validMoves: EvaluatedPlacement[] = [{} as unknown as EvaluatedPlacement];
            service.attemptMove(DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, validMoves);
            assert(stubAttemptMoveDirection.calledTwice);
            expect(validMoves.length).to.equal(2);
        });

        it('should add the EvaluatedPlacement that are valid (1)', () => {
            const stubAttemptMoveDirection = stub(service, 'attemptMoveDirection');
            stubAttemptMoveDirection.onCall(0).returns(undefined);
            stubAttemptMoveDirection.onCall(1).returns({} as unknown as EvaluatedPlacement);
            const validMoves: EvaluatedPlacement[] = [{} as unknown as EvaluatedPlacement];
            service.attemptMove(DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, validMoves);
            assert(stubAttemptMoveDirection.calledTwice);
            expect(validMoves.length).to.equal(2);
        });
    });

    describe('findMinimumWordLength', () => {
        it('should call navigator.moveUntil', () => {
            const spy = chai.spy.on(navigator, 'moveUntil', () => {
                return true;
            });
            service.findMinimumWordLength(navigator);
            expect(spy).to.have.been.called;
        });

        it('should return POSITIVE_INFINITY if there is no neighbor', () => {
            navigator = navigator.switchOrientation();
            expect(service.findMinimumWordLength(navigator)).to.equal(Number.POSITIVE_INFINITY);
        });

        it('should return the correct amount of tiles if there is a neighbor on the side', () => {
            navigator = new BoardNavigator(board, new Position(0, 1), Orientation.Horizontal);
            expect(service.findMinimumWordLength(navigator)).to.equal(2);
        });

        it('should return the correct amount of tiles if there the center', () => {
            board.grid[2][0].isCenter = true;
            navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
            expect(service.findMinimumWordLength(navigator)).to.equal(3);
        });

        it('should return the correct amount of tiles if there is a neighbor on the path', () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
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

    describe('findSquareProperties', () => {
        it('should call findProperties twice', () => {
            const spy = chai.spy.on(service, 'findProperties');
            service.findSquareProperties(board, DEFAULT_SQUARE_1, DEFAULT_TILES_LEFT_SIZE);
            expect(spy).to.have.been.called.twice;
        });

        it('should return the correct SquareProperties  ', () => {
            const stubFindProperties = stub(service, 'findProperties');
            stubFindProperties.onCall(0).returns(DEFAULT_HORIZONTAL_PROPERTIES);
            stubFindProperties.onCall(1).returns(DEFAULT_VERTICAL_PROPERTIES);

            chai.spy.on(BoardNavigator, 'isEmpty', () => {
                return true;
            });
            expect(service.findSquareProperties(board, DEFAULT_SQUARE_1, DEFAULT_TILES_LEFT_SIZE)).to.deep.equal(DEFAULT_SQUARE_PROPERTIES);
        });
    });

    describe('getRandomSquare', () => {
        it('should remove 1 element form array and return it', () => {
            const arrayCopy: Square[] = JSON.parse(JSON.stringify(DEFAULT_SQUARE_ARRAY));
            const removedSquare = service.getRandomSquare(arrayCopy);
            expect(arrayCopy.length).to.equal(DEFAULT_SQUARE_ARRAY.length - 1);
            expect(DEFAULT_SQUARE_ARRAY.some((square) => JSON.stringify(square) === JSON.stringify(removedSquare))).to.be.true;
            expect(arrayCopy.includes(removedSquare)).to.be.false;
        });
    });

    describe('getCorrespondingMovePossibility', () => {
        it('should the horizontal move property if asked', () => {
            expect(service.getCorrespondingMovePossibility(DEFAULT_SQUARE_PROPERTIES, Orientation.Horizontal)).to.deep.equal(
                DEFAULT_SQUARE_PROPERTIES.horizontal,
            );
        });

        it('should the vertical move property if asked', () => {
            expect(service.getCorrespondingMovePossibility(DEFAULT_SQUARE_PROPERTIES, Orientation.Vertical)).to.deep.equal(
                DEFAULT_SQUARE_PROPERTIES.vertical,
            );
        });
    });

    describe('getCorrespondingMovePossibility', () => {
        it('should get the horizontal move property if asked', () => {
            expect(service.getCorrespondingMovePossibility(DEFAULT_SQUARE_PROPERTIES, Orientation.Horizontal)).to.deep.equal(
                DEFAULT_SQUARE_PROPERTIES.horizontal,
            );
        });

        it('should get the vertical move property if asked', () => {
            expect(service.getCorrespondingMovePossibility(DEFAULT_SQUARE_PROPERTIES, Orientation.Vertical)).to.deep.equal(
                DEFAULT_SQUARE_PROPERTIES.vertical,
            );
        });
    });

    describe('isWithin', () => {
        it('should return true if the target if within the movePossibilities range', () => {
            expect(service.isWithin(DEFAULT_HORIZONTAL_PROPERTIES, DEFAULT_HORIZONTAL_PROPERTIES.minimumLength)).to.be.true;
        });

        it('should return false if the target if within the movePossibilities range', () => {
            expect(service.isWithin(DEFAULT_HORIZONTAL_PROPERTIES, DEFAULT_HORIZONTAL_PROPERTIES.maximumLength + 1)).to.be.false;
        });
    });

    describe('combination', () => {
        it('should return an empty array if the rack is empty (0 tiles)', () => {
            const expected: Tile[][] = [];
            expect(service.combination(EMPTY_TILE_RACK)).to.deep.equal(expected);
        });

        it('should return all combinations of the given tiles (1 tile)', () => {
            const expected: Tile[][] = [[DEFAULT_TILE_A]];
            expect(service.combination(SINGLE_TILE_TILE_RACK)).to.deep.equal(expected);
        });

        it('should return all combinations of the given tiles (3 tiles)', () => {
            const expected: Tile[][] = [
                [DEFAULT_TILE_A],
                [DEFAULT_TILE_B],
                [DEFAULT_TILE_A, DEFAULT_TILE_B],
                [DEFAULT_TILE_C],
                [DEFAULT_TILE_A, DEFAULT_TILE_C],
                [DEFAULT_TILE_B, DEFAULT_TILE_C],
                [DEFAULT_TILE_A, DEFAULT_TILE_B, DEFAULT_TILE_C],
            ];
            expect(service.combination(SMALL_TILE_RACK)).to.deep.equal(expected);
        });
    });

    describe('permuteTiles', () => {
        it('should result should be an empty array if the rack is empty (0 tiles)', () => {
            const expected: Tile[][] = [[]];
            const result: Tile[][] = [];
            service.permuteTiles(EMPTY_TILE_RACK, result);
            expect(result).to.deep.equal(expected);
        });

        it('should return all combinations of the given tiles (1 tile)', () => {
            const expected: Tile[][] = [[DEFAULT_TILE_A]];
            const result: Tile[][] = [];
            service.permuteTiles(SINGLE_TILE_TILE_RACK, result);
            expect(result).to.deep.equal(expected);
        });

        it('should return all combinations of the given tiles (3 tiles)', () => {
            const result: Tile[][] = [];
            const expected: Tile[][] = [
                [DEFAULT_TILE_A, DEFAULT_TILE_B, DEFAULT_TILE_C],
                [DEFAULT_TILE_A, DEFAULT_TILE_C, DEFAULT_TILE_B],
                [DEFAULT_TILE_B, DEFAULT_TILE_A, DEFAULT_TILE_C],
                [DEFAULT_TILE_B, DEFAULT_TILE_C, DEFAULT_TILE_A],
                [DEFAULT_TILE_C, DEFAULT_TILE_A, DEFAULT_TILE_B],
                [DEFAULT_TILE_C, DEFAULT_TILE_B, DEFAULT_TILE_A],
            ];
            service.permuteTiles(SMALL_TILE_RACK, result);
            expect(result).to.deep.equal(expected);
        });
    });

    describe('getRackPermutations', () => {
        it('should call combination and permuteTiles', () => {
            const spyCombination = chai.spy.on(service, 'combination');
            const spyPermuteTiles = chai.spy.on(service, 'permuteTiles');
            service.getRackPermutations(SINGLE_TILE_TILE_RACK);
            expect(spyCombination).to.have.been.called;
            expect(spyPermuteTiles).to.have.been.called;
        });

        it('should return an empty array if the tile rack is empty', () => {
            const expected: Tile[][] = [];
            const result: Tile[][] = service.getRackPermutations(EMPTY_TILE_RACK);
            expect(result).to.deep.equal(expected);
        });

        it('should return an array containing the only tile in the rack', () => {
            const expected: Tile[][] = [SINGLE_TILE_TILE_RACK];
            const result: Tile[][] = service.getRackPermutations(SINGLE_TILE_TILE_RACK);

            expect(result).to.deep.equal(expected);
        });

        it('should return an array containing all possible permutations of the tilerack (3)', () => {
            const expected: Tile[][] = [
                [DEFAULT_TILE_A],
                [DEFAULT_TILE_B],
                [DEFAULT_TILE_A, DEFAULT_TILE_B],
                [DEFAULT_TILE_B, DEFAULT_TILE_A],
                [DEFAULT_TILE_C],
                [DEFAULT_TILE_A, DEFAULT_TILE_C],
                [DEFAULT_TILE_C, DEFAULT_TILE_A],
                [DEFAULT_TILE_B, DEFAULT_TILE_C],
                [DEFAULT_TILE_C, DEFAULT_TILE_B],
                [DEFAULT_TILE_A, DEFAULT_TILE_B, DEFAULT_TILE_C],
                [DEFAULT_TILE_A, DEFAULT_TILE_C, DEFAULT_TILE_B],
                [DEFAULT_TILE_B, DEFAULT_TILE_A, DEFAULT_TILE_C],
                [DEFAULT_TILE_B, DEFAULT_TILE_C, DEFAULT_TILE_A],
                [DEFAULT_TILE_C, DEFAULT_TILE_A, DEFAULT_TILE_B],
                [DEFAULT_TILE_C, DEFAULT_TILE_B, DEFAULT_TILE_A],
            ];
            const result: Tile[][] = service.getRackPermutations(SMALL_TILE_RACK);
            expect(result).to.deep.equal(expected);
        });

        it('should return an array containing all possible permutations of the tilerack (7)', () => {
            let expectedLength = 0;
            for (let tilesToChoose = BIG_TILE_RACK.length; tilesToChoose > 0; tilesToChoose--) {
                expectedLength += permutationAmount(BIG_TILE_RACK.length, tilesToChoose);
            }
            const result: Tile[][] = service.getRackPermutations(BIG_TILE_RACK);
            expect(result.length).to.deep.equal(expectedLength);
        });
    });
});
