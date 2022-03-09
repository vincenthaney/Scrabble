/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { assert, expect } from 'chai';
import { Container } from 'typedi';
import WordFindingService from './word-finding';
import * as chai from 'chai';
import { stub, useFakeTimers } from 'sinon';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { StringConversion } from '@app/utils/string-conversion';
import { INVALID_REQUEST_POINT_RANGE, NO_REQUEST_POINT_HISTORIC, NO_REQUEST_POINT_RANGE } from '@app/constants/services-errors';
import { LONG_MOVE_TIME, QUICK_MOVE_TIME } from '@app/constants/services-constants/word-finding.const';
import { EvaluatedPlacement } from '@app/classes/word-finding/word-placement';
import { EvaluationInfo, SearchState, SquareProperties, WordFindingRequest, WordFindingUsage } from '@app/classes/word-finding';

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
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 2 };
const DEFAULT_TILE_C: Tile = { letter: 'C', value: 3 };
const DEFAULT_TILE_D: Tile = { letter: 'D', value: 4 };
const DEFAULT_TILE_E: Tile = { letter: 'E', value: 5 };
const DEFAULT_TILE_BLANK_E: Tile = { letter: 'E', value: 0, isBlank: true };
const DEFAULT_TILE_F: Tile = { letter: 'F', value: 6 };
const DEFAULT_TILE_G: Tile = { letter: 'G', value: 7 };
const DEFAULT_TILE_WILD: Tile = { letter: '*', value: 0, isBlank: true };
const EMPTY_TILE_RACK: Tile[] = [];
const SINGLE_TILE_TILE_RACK = [DEFAULT_TILE_A];
const SMALL_TILE_RACK = [DEFAULT_TILE_A, DEFAULT_TILE_B, DEFAULT_TILE_C];
const BIG_TILE_RACK = [DEFAULT_TILE_A, DEFAULT_TILE_B, DEFAULT_TILE_C, DEFAULT_TILE_D, DEFAULT_TILE_E, DEFAULT_TILE_F, DEFAULT_TILE_G];

const DEFAULT_SQUARE_1: Square = { tile: null, position: new Position(0, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_2: Square = { tile: null, position: new Position(0, 1), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_3: Square = { tile: null, position: new Position(0, 2), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_4: Square = { tile: null, position: new Position(0, 3), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_ARRAY = [DEFAULT_SQUARE_1, DEFAULT_SQUARE_2, DEFAULT_SQUARE_3, DEFAULT_SQUARE_4];
const DEFAULT_TILES_LEFT_SIZE = 7;
const DEFAULT_SMALL_TILES_LEFT_SIZE = 3;
const DEFAULT_ORIENTATION = Orientation.Horizontal;

const DEFAULT_HORIZONTAL_PROPERTIES = { isValid: true, minimumLength: 1, maximumLength: 2 };
const DEFAULT_VERTICAL_PROPERTIES = { isValid: true, minimumLength: 1, maximumLength: 3 };
const DEFAULT_SQUARE_PROPERTIES = {
    square: DEFAULT_SQUARE_1,
    horizontal: DEFAULT_HORIZONTAL_PROPERTIES,
    vertical: DEFAULT_VERTICAL_PROPERTIES,
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
    usage: WordFindingUsage.Beginner,
    pointHistoric: DEFAULT_HISTORIC,
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

const DEFAULT_MOVE_5 = {
    tilesToPlace: SINGLE_TILE_TILE_RACK,
    orientation: Orientation.Horizontal,
    startPosition: DEFAULT_SQUARE_3.position,
    score: 5,
};

const SINGLE_VALID_MOVES: EvaluatedPlacement[] = [DEFAULT_MOVE_5];

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
            const spyAttemptPermutations = chai.spy.on(service, 'attemptPermutations');
            const spyChooseMove = chai.spy.on(service, 'chooseMove');

            service.findWords(board, BIG_TILE_RACK, request);
            expect(spyGetRackPermutations).to.have.been.called;
            expect(spyGetDesiredSquares).to.have.been.called;
            expect(spyGetRandomSquare).to.have.been.called;
            expect(spyFindSquareProperties).to.have.been.called;
            expect(spyAttemptPermutations).to.have.been.called;
            expect(spyChooseMove).to.have.been.called;
        });

        it('should set timeOver to true and stop processing when timeout ', () => {
            const clock = useFakeTimers();
            const spyGetRackPermutations = chai.spy.on(service, 'getRackPermutations', () => {
                clock.tick(LONG_MOVE_TIME + 1);
                return [SMALL_TILE_RACK, SINGLE_TILE_TILE_RACK];
            });
            const spyGetDesiredSquares = chai.spy.on(service, 'getDesiredSquares', () => {
                return DEFAULT_SQUARE_ARRAY;
            });
            const spyGetRandomSquare = chai.spy.on(service, 'getRandomSquare');
            const spyFindSquareProperties = chai.spy.on(service, 'findSquareProperties');
            const spyAttemptPermutations = chai.spy.on(service, 'attemptPermutations');
            const spyEvaluate = chai.spy.on(service, 'evaluate');

            service.findWords(board, BIG_TILE_RACK, request);
            expect(spyGetRackPermutations).to.have.been.called;
            expect(spyGetDesiredSquares).to.have.been.called;
            expect(spyGetRandomSquare).not.to.have.been.called;
            expect(spyFindSquareProperties).not.to.have.been.called;
            expect(spyAttemptPermutations).not.to.have.been.called;
            expect(spyEvaluate).to.have.been.called;

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

    describe('evaluate', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should call evaluateHint if the request usage is Hint', () => {
            request.usage = WordFindingUsage.Hint;
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(service, 'evaluateHint', () => {});
            service.evaluate({} as unknown as SearchState, request, {} as unknown as EvaluationInfo);
            expect(spy).to.have.been.called;
        });

        it('should call evaluateExpert if the request usage is Expert', () => {
            request.usage = WordFindingUsage.Expert;
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(service, 'evaluateExpert', () => {});
            service.evaluate({} as unknown as SearchState, request, {} as unknown as EvaluationInfo);
            expect(spy).to.have.been.called;
        });

        it('should call evaluateBeginner if the request usage is Beginner', () => {
            request.usage = WordFindingUsage.Beginner;
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(service, 'evaluateBeginner', () => {});
            service.evaluate({} as unknown as SearchState, request, {} as unknown as EvaluationInfo);
            expect(spy).to.have.been.called;
        });
    });

    describe('attemptPermutations', () => {
        it('should call attemptMove rackPermutations.length times', () => {
            const spyAttemptMove = stub(service, 'attemptMove');

            service.attemptPermutations([[], [], []], {} as unknown as SquareProperties, []);
            assert(spyAttemptMove.calledThrice);
        });
    });

    describe('evaluateHint', () => {
        it('should return 3 moves if there are atleast 3 of them', () => {
            const info = {
                foundMoves: [],
                rejectedValidMoves: [],
                validMoves: DEFAULT_VALID_MOVES,
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            expect(service.evaluateHint(info)?.length).to.equal(3);
        });

        it('should return undefined if there are less than 3 moves', () => {
            const info = {
                foundMoves: [{} as unknown as EvaluatedPlacement, {} as unknown as EvaluatedPlacement],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            expect(service.evaluateHint(info)).to.be.undefined;
        });

        it('should add foundMoves to validMoves ', () => {
            const info = {
                foundMoves: SINGLE_VALID_MOVES,
                rejectedValidMoves: [],
                validMoves: DEFAULT_VALID_MOVES,
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            service.evaluateHint(info);
            expect(info.validMoves.length).to.equal(DEFAULT_VALID_MOVES.length + SINGLE_VALID_MOVES.length);
        });
    });

    describe('evaluateExpert', () => {
        it('should return 1 move if the searchState is over and there is atleast 1 move', () => {
            const expected = { score: 3 } as unknown as EvaluatedPlacement;
            const info = {
                foundMoves: [
                    { score: 1 } as unknown as EvaluatedPlacement,
                    { score: 2 } as unknown as EvaluatedPlacement,
                    expected,
                    { score: 1 } as unknown as EvaluatedPlacement,
                ],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            expect(service.evaluateExpert(SearchState.Over, info)).to.deep.equal([expected]);
        });

        it('should return undefined if the searchState is not over', () => {
            const info = {
                foundMoves: [{} as unknown as EvaluatedPlacement, {} as unknown as EvaluatedPlacement],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            expect(service.evaluateExpert(SearchState.Selective, info)).to.be.undefined;
        });

        it('should add foundMoves to validMoves ', () => {
            const info = {
                foundMoves: [{} as unknown as EvaluatedPlacement, {} as unknown as EvaluatedPlacement],
                rejectedValidMoves: [],
                validMoves: [{} as unknown as EvaluatedPlacement],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            service.evaluateExpert(SearchState.Over, info);
            expect(info.validMoves.length).to.equal(3);
        });
    });

    describe('evaluateBeginner', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should call getMovesInRange', () => {
            const spy = chai.spy.on(service, 'getMovesInRange');
            const info = {
                foundMoves: [],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            service.evaluateBeginner(SearchState.Over, request, info);
            expect(spy).to.have.been.called;
        });

        it('should call acceptMove and return the first accepted move if in Selective state', () => {
            const scoreMap: Map<number, EvaluatedPlacement[]> = new Map([
                [DEFAULT_MOVE_2.score, [DEFAULT_MOVE_2, DEFAULT_MOVE_2]],
                [DEFAULT_MOVE_3.score, [DEFAULT_MOVE_3]],
                [DEFAULT_MOVE_4.score, [DEFAULT_MOVE_4, DEFAULT_MOVE_4]],
            ]);
            chai.spy.on(service, 'getMovesInRange', () => {
                return scoreMap;
            });
            const spyAcceptMove = chai.spy.on(service, 'acceptMove', () => {
                return true;
            });
            const info = {
                foundMoves: [],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            expect(service.evaluateBeginner(SearchState.Selective, request, info)).to.deep.equal([DEFAULT_MOVE_2]);
            expect(spyAcceptMove).to.have.been.called;
        });

        it('should add the rejected moves to rejectedValidMoves', () => {
            const scoreMap: Map<number, EvaluatedPlacement[]> = new Map([
                [DEFAULT_MOVE_2.score, [DEFAULT_MOVE_2, DEFAULT_MOVE_2]],
                [DEFAULT_MOVE_3.score, [DEFAULT_MOVE_3]],
                [DEFAULT_MOVE_4.score, [DEFAULT_MOVE_4, DEFAULT_MOVE_4]],
            ]);
            chai.spy.on(service, 'getMovesInRange', () => {
                return scoreMap;
            });
            const pointDistributionChance: Map<number, number> = new Map([
                [DEFAULT_MOVE_2.score, 1],
                [DEFAULT_MOVE_3.score, 2],
                [DEFAULT_MOVE_4.score, 3],
            ]);
            const expected: [number, EvaluatedPlacement][] = [
                [1, DEFAULT_MOVE_2],
                [1, DEFAULT_MOVE_2],
                [2, DEFAULT_MOVE_3],
                [3, DEFAULT_MOVE_4],
                [3, DEFAULT_MOVE_4],
            ];
            chai.spy.on(service, 'acceptMove', () => {
                return false;
            });
            const info = {
                foundMoves: [],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance,
            };
            expect(service.evaluateBeginner(SearchState.Selective, request, info)).to.be.undefined;
            expect(info.rejectedValidMoves).to.deep.equal(expected);
        });

        it('should return the highest chance rejected move if not in Selective mode', () => {
            const scoreMap: Map<number, EvaluatedPlacement[]> = new Map([
                [DEFAULT_MOVE_2.score, [DEFAULT_MOVE_2, DEFAULT_MOVE_2]],
                [DEFAULT_MOVE_3.score, [DEFAULT_MOVE_3]],
                [DEFAULT_MOVE_4.score, [DEFAULT_MOVE_4, DEFAULT_MOVE_4]],
            ]);
            chai.spy.on(service, 'getMovesInRange', () => {
                return scoreMap;
            });
            const pointDistributionChance: Map<number, number> = new Map([
                [DEFAULT_MOVE_2.score, 1],
                [DEFAULT_MOVE_3.score, 2],
                [DEFAULT_MOVE_4.score, 3],
            ]);
            chai.spy.on(service, 'acceptMove', () => {
                return false;
            });
            const info = {
                foundMoves: [],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance,
            };
            expect(service.evaluateBeginner(SearchState.Unselective, request, info)).to.deep.equal([DEFAULT_MOVE_4]);
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

        it('should return a map containing an array of each score ', () => {
            const expected: Map<number, EvaluatedPlacement[]> = new Map([
                [DEFAULT_MOVE_2.score, [DEFAULT_MOVE_2, DEFAULT_MOVE_2]],
                [DEFAULT_MOVE_3.score, [DEFAULT_MOVE_3]],
                [DEFAULT_MOVE_4.score, [DEFAULT_MOVE_4, DEFAULT_MOVE_4]],
            ]);
            expect(service.getMovesInRange(DEFAULT_VALID_MOVES, request)).to.deep.equal(expected);
        });
    });

    describe('findMinRangeFrequency', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should throw if there is no pointRange', () => {
            request.pointRange = undefined;
            const result = () => service.findMinRangeFrequency(request);
            expect(result).to.Throw(NO_REQUEST_POINT_RANGE);
        });

        it('should throw if there is no pointHistoric', () => {
            request.pointHistoric = undefined;
            const result = () => service.findMinRangeFrequency(request);
            expect(result).to.Throw(NO_REQUEST_POINT_HISTORIC);
        });

        it('should throw if there is an invalid pointRange', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.minimum = request.pointRange!.maximum + 1;
            const result = () => service.findMinRangeFrequency(request);
            expect(result).to.Throw(INVALID_REQUEST_POINT_RANGE);
        });

        it('should return the correct maximum and minimum in the given range ', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.minimum = 2;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.maximum = 8;
            expect(service.findMinRangeFrequency(request)).to.deep.equal(1);
        });

        it('should return the correct maximum and minimum in the given range ', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.minimum = 0;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.maximum = 20;
            expect(service.findMinRangeFrequency(request)).to.deep.equal(1);
        });
    });

    describe('distributeChance', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should throw if there is no pointRange', () => {
            request.pointRange = undefined;
            const result = () => service.distributeChance(request);
            expect(result).to.Throw(NO_REQUEST_POINT_RANGE);
        });

        it('should throw if there is no pointHistoric', () => {
            request.pointHistoric = undefined;
            const result = () => service.distributeChance(request);
            expect(result).to.Throw(NO_REQUEST_POINT_HISTORIC);
        });

        it('should throw if there is an invalid pointRange', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.minimum = request.pointRange!.maximum + 1;
            const result = () => service.distributeChance(request);
            expect(result).to.Throw(INVALID_REQUEST_POINT_RANGE);
        });

        it('should return the chances for scores in the given range ', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.minimum = 2;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.maximum = 8;
            /* eslint-disable @typescript-eslint/no-magic-numbers */
            const expected: Map<number, number> = new Map([
                [2, 0.5],
                [3, 1],
                [4, 1],
                [5, 1],
                [6, 1],
                [7, 1],
                [8, 0.5],
            ]);
            expect(service.distributeChance(request)).to.deep.equal(expected);
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

    describe('findMovePossibilities', () => {
        it('should call findMinimumWordLength and findMaximumWordTileLeftLength', () => {
            const spyFindMinimumWordLength = chai.spy.on(service, 'findMinimumWordLength', () => {
                return 0;
            });
            const spyFindMaximumWordTileLeftLength = chai.spy.on(service, 'findMaximumWordTileLeftLength', () => {
                return 0;
            });
            service.findMovePossibilities(navigator, DEFAULT_TILES_LEFT_SIZE);
            expect(spyFindMinimumWordLength).to.have.been.called;
            expect(spyFindMaximumWordTileLeftLength).to.have.been.called;
        });

        it('should return isValid = false if findMinimumWordLength is POSITIVE_INFINITY ', () => {
            const spyFindMinimumWordLength = chai.spy.on(service, 'findMinimumWordLength', () => {
                return Number.POSITIVE_INFINITY;
            });
            const spyFindMaximumWordTileLeftLength = chai.spy.on(service, 'findMaximumWordTileLeftLength', () => {
                return 0;
            });
            expect(service.findMovePossibilities(navigator, DEFAULT_TILES_LEFT_SIZE).isValid).to.be.false;
            expect(spyFindMinimumWordLength).to.have.been.called;
            expect(spyFindMaximumWordTileLeftLength).not.to.have.been.called;
        });

        it('should return isValid = false if findMinimumWordLength is too big ', () => {
            const spyFindMinimumWordLength = chai.spy.on(service, 'findMinimumWordLength', () => {
                return DEFAULT_TILES_LEFT_SIZE + 1;
            });
            const spyFindMaximumWordTileLeftLength = chai.spy.on(service, 'findMaximumWordTileLeftLength', () => {
                return 0;
            });
            expect(service.findMovePossibilities(navigator, DEFAULT_TILES_LEFT_SIZE).isValid).to.be.false;
            expect(spyFindMinimumWordLength).to.have.been.called;
            expect(spyFindMaximumWordTileLeftLength).not.to.have.been.called;
        });

        it('should return the correct moveProperties ', () => {
            const minLength = 1;
            const maxLength = 4;
            const expected = { isValid: true, minimumLength: minLength, maximumLength: DEFAULT_TILES_LEFT_SIZE - maxLength };
            chai.spy.on(service, 'findMinimumWordLength', () => {
                return minLength;
            });
            const spyFindMaximumWordTileLeftLength = chai.spy.on(service, 'findMaximumWordTileLeftLength', () => {
                return maxLength;
            });
            expect(service.findMovePossibilities(navigator, DEFAULT_TILES_LEFT_SIZE)).to.deep.equal(expected);
            expect(spyFindMaximumWordTileLeftLength).to.have.been.called.with(navigator, DEFAULT_TILES_LEFT_SIZE - minLength);
        });
    });

    describe('findSquareProperties', () => {
        it('should call findMovePossibilities twice', () => {
            const spy = chai.spy.on(service, 'findMovePossibilities');
            service.findSquareProperties(board, DEFAULT_SQUARE_1, DEFAULT_TILES_LEFT_SIZE);
            expect(spy).to.have.been.called.twice;
        });

        it('should return the correct SquareProperties  ', () => {
            const stubFindMovePossibilities = stub(service, 'findMovePossibilities');
            stubFindMovePossibilities.onCall(0).returns(DEFAULT_HORIZONTAL_PROPERTIES);
            stubFindMovePossibilities.onCall(1).returns(DEFAULT_VERTICAL_PROPERTIES);

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

    describe('updateState', () => {
        it('should return SearchState.Over if the time exceeds the limit', () => {
            const OVER_DATE = new Date(Date.now() - LONG_MOVE_TIME - 100);
            expect(service.updateState(OVER_DATE)).to.deep.equal(SearchState.Over);
        });

        it('should return SearchState.Unselective if the time exceeds the limit short time limit but not the long time limit', () => {
            const UNSELECTIVE_DATE = new Date(Date.now() - QUICK_MOVE_TIME - 100);
            expect(service.updateState(UNSELECTIVE_DATE)).to.deep.equal(SearchState.Unselective);
        });

        it('should return SearchState.Selective if the time does not exceed the short time limit', () => {
            const START_DATE = new Date(Date.now());
            expect(service.updateState(START_DATE)).to.deep.equal(SearchState.Selective);
        });
    });

    describe('acceptMove', () => {
        it('should not always return true if the chance is not 100%', () => {
            let result;
            let sameResult = true;
            const iterations = 100;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const map = new Map([[2, 0.5]]);
            for (let i = 0; i < iterations; i++) {
                const tmp = service.acceptMove({ score: 2 } as unknown as EvaluatedPlacement, map);
                if (tmp !== result && i !== 0) {
                    sameResult = false;
                    break;
                } else {
                    result = tmp;
                }
            }
            expect(sameResult).to.be.false;
        });

        it('should not always  true if the chance is 100%', () => {
            let result;
            let sameResult = true;
            const iterations = 10;
            const map = new Map([[2, 1]]);
            for (let i = 0; i < iterations; i++) {
                const tmp = service.acceptMove({ score: 2 } as unknown as EvaluatedPlacement, map);
                if (tmp !== result && i !== 0) {
                    sameResult = false;
                    break;
                } else {
                    result = tmp;
                }
            }
            expect(sameResult).to.be.true;
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

        it('should return all combinations of the given tiles (blank tile)', () => {
            const expected: Tile[][] = [[DEFAULT_TILE_BLANK_E]];
            expect(service.combination([DEFAULT_TILE_WILD])).to.deep.equal(expected);
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
