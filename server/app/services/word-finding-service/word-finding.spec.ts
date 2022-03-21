/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import {
    MoveRequirements,
    PlacementEvaluationResults,
    RejectedMove,
    SearchState,
    SquareProperties,
    WordFindingRequest,
    WordFindingUseCase,
} from '@app/classes/word-finding';
import { ScoredWordPlacement } from '@app/classes/word-finding/word-placement';
import { BLANK_TILE_LETTER_VALUE } from '@app/constants/game';
import { LONG_MOVE_TIME, QUICK_MOVE_TIME } from '@app/constants/services-constants/word-finding.const';
import { INVALID_REQUEST_POINT_RANGE, NO_REQUEST_POINT_HISTORY, NO_REQUEST_POINT_RANGE } from '@app/constants/services-errors';
import { getDictionaryTestService } from '@app/services/dictionary-service/dictionary-test.service.spec';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { StringConversion } from '@app/utils/string-conversion';
import * as chai from 'chai';
import { assert, expect } from 'chai';
import { stub, useFakeTimers } from 'sinon';
import { Container } from 'typedi';
import WordFindingService from './word-finding';

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
const DEFAULT_TILE_WILD: Tile = { letter: BLANK_TILE_LETTER_VALUE, value: 0, isBlank: true };
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

const DEFAULT_HORIZONTAL_PROPERTIES: MoveRequirements = { isPossible: true, minimumLength: 1, maximumLength: 2 };
const DEFAULT_VERTICAL_PROPERTIES: MoveRequirements = { isPossible: true, minimumLength: 1, maximumLength: 3 };
const DEFAULT_SQUARE_PROPERTIES: SquareProperties = {
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
    useCase: WordFindingUseCase.Beginner,
    pointHistory: DEFAULT_HISTORIC,
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

const SINGLE_VALID_MOVES: ScoredWordPlacement[] = [DEFAULT_MOVE_5];

const DEFAULT_VALID_MOVES: ScoredWordPlacement[] = [DEFAULT_MOVE_2, BEST_MOVE, DEFAULT_MOVE_3, DEFAULT_MOVE_4, DEFAULT_MOVE_4, DEFAULT_MOVE_2];

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

        Container.set(DictionaryService, getDictionaryTestService());
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
            const spyExtractRandomSquare = chai.spy.on(service, 'extractRandomSquare');
            const spyFindSquareProperties = chai.spy.on(service, 'findSquareProperties');
            const spyAttemptPermutations = chai.spy.on(service, 'attemptPermutations');
            const spyChooseMove = chai.spy.on(service, 'chooseMove');

            service.findWords(board, BIG_TILE_RACK, request);
            expect(spyGetRackPermutations).to.have.been.called;
            expect(spyGetDesiredSquares).to.have.been.called;
            expect(spyExtractRandomSquare).to.have.been.called;
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
            const spyExtractRandomSquare = chai.spy.on(service, 'extractRandomSquare');
            const spyFindSquareProperties = chai.spy.on(service, 'findSquareProperties');
            const spyAttemptPermutations = chai.spy.on(service, 'attemptPermutations');
            const spyEvaluate = chai.spy.on(service, 'chooseMoves');

            service.findWords(board, BIG_TILE_RACK, request);
            expect(spyGetRackPermutations).to.have.been.called;
            expect(spyGetDesiredSquares).to.have.been.called;
            expect(spyExtractRandomSquare).not.to.have.been.called;
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
            const spyIsWithin = chai.spy.on(service, 'isWithinRequirements', () => {
                return true;
            });

            const stubwordsToString = stub(StringConversion, 'wordsToString');
            // eslint-disable-next-line dot-notation
            const spyExtract = chai.spy.on(service['wordExtraction'], 'extract');
            // eslint-disable-next-line dot-notation
            const spyVerifyWords = chai.spy.on(service['wordVerificationService'], 'verifyWords');

            service['attemptMoveDirection'](DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, Orientation.Horizontal);
            expect(spyGetCorrespondingMovePossibility).to.have.been.called;
            expect(spyIsWithin).to.have.been.called;
            assert(stubwordsToString.calledOnce);
            expect(spyExtract).to.have.been.called;
            expect(spyVerifyWords).to.have.been.called;
            stubwordsToString.restore();
        });

        it('should return undefined if an error is thrown', () => {
            chai.spy.on(service, 'getCorrespondingMovePossibility', () => {
                return DEFAULT_SQUARE_PROPERTIES.horizontal;
            });
            chai.spy.on(service, 'isWithinRequirements', () => {
                return true;
            });
            // eslint-disable-next-line dot-notation
            chai.spy.on(service['wordExtraction'], 'extract', () => {
                throw new Error();
            });

            expect(service['attemptMoveDirection'](DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, Orientation.Horizontal)).to.be.undefined;
        });

        it('should return undefined if it isnt within the possible range', () => {
            chai.spy.on(service, 'getCorrespondingMovePossibility', () => {
                return DEFAULT_SQUARE_PROPERTIES.horizontal;
            });
            chai.spy.on(service, 'isWithinRequirements', () => {
                return false;
            });
            expect(service['attemptMoveDirection'](DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, Orientation.Horizontal)).to.be.undefined;
        });

        it('should return the current permutation as a WordPlacement if everything succeeds', () => {
            chai.spy.on(service, 'getCorrespondingMovePossibility', () => {
                return DEFAULT_SQUARE_PROPERTIES.horizontal;
            });
            chai.spy.on(service, 'isWithinRequirements', () => {
                return true;
            });
            const stubwordsToString = stub(StringConversion, 'wordsToString').returns(['']);

            // eslint-disable-next-line dot-notation
            chai.spy.on(service['wordExtraction'], 'extract');
            // eslint-disable-next-line dot-notation
            chai.spy.on(service['wordVerificationService'], 'verifyWords', () => undefined);
            const expected = {
                tilesToPlace: SMALL_TILE_RACK,
                orientation: Orientation.Horizontal,
                startPosition: DEFAULT_SQUARE_PROPERTIES.square.position,
                score: 13,
            };

            expect(service['attemptMoveDirection'](DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK, Orientation.Horizontal)).to.deep.equal(expected);
            stubwordsToString.restore();
        });
    });

    describe('chooseMoves', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should call chooseMovesHint if the request useCase is Hint', () => {
            request.useCase = WordFindingUseCase.Hint;
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(service, 'chooseMovesHint', () => {});
            service['chooseMoves']({} as unknown as SearchState, request, {} as unknown as PlacementEvaluationResults);
            expect(spy).to.have.been.called;
        });

        it('should call chooseMovesExpert if the request useCase is Expert', () => {
            request.useCase = WordFindingUseCase.Expert;
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(service, 'chooseMovesExpert', () => {});
            service['chooseMoves']({} as unknown as SearchState, request, {} as unknown as PlacementEvaluationResults);
            expect(spy).to.have.been.called;
        });

        it('should call chooseMovesBeginner if the request useCase is Beginner', () => {
            request.useCase = WordFindingUseCase.Beginner;
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(service, 'chooseMovesBeginner', () => {});
            service['chooseMoves']({} as unknown as SearchState, request, {} as unknown as PlacementEvaluationResults);
            expect(spy).to.have.been.called;
        });
    });

    describe('attemptPermutations', () => {
        it('should call attemptMove rackPermutations.length times', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const spyAttemptMove = stub(service, <any>'attemptMove').callsFake(() => {
                return [{ score: 1 } as unknown as ScoredWordPlacement];
            });

            expect(service['attemptPermutations']([[], [], []], {} as unknown as SquareProperties).length).to.equal(3);
            assert(spyAttemptMove.calledThrice);
        });
    });

    describe('chooseMovesHint', () => {
        it('should return 3 moves if there are atleast 3 of them', () => {
            const info = {
                foundMoves: [],
                rejectedValidMoves: [],
                validMoves: DEFAULT_VALID_MOVES,
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            expect(service['chooseMovesHint'](info)?.length).to.equal(3);
        });

        it('should return undefined if there are less than 3 moves', () => {
            const info = {
                foundMoves: [{} as unknown as ScoredWordPlacement, {} as unknown as ScoredWordPlacement],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            expect(service['chooseMovesHint'](info)).to.be.undefined;
        });

        it('should add foundMoves to validMoves ', () => {
            const info = {
                foundMoves: SINGLE_VALID_MOVES,
                rejectedValidMoves: [],
                validMoves: DEFAULT_VALID_MOVES,
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            service['chooseMovesHint'](info);
            expect(info.validMoves.length).to.equal(DEFAULT_VALID_MOVES.length + SINGLE_VALID_MOVES.length);
        });
    });

    describe('chooseMovesExpert', () => {
        it('should return 1 move if the searchState is over and there is atleast 1 move', () => {
            const expected = { score: 3 } as unknown as ScoredWordPlacement;
            const info = {
                foundMoves: [
                    { score: 1 } as unknown as ScoredWordPlacement,
                    { score: 2 } as unknown as ScoredWordPlacement,
                    expected,
                    { score: 1 } as unknown as ScoredWordPlacement,
                ],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            expect(service['chooseMovesExpert'](SearchState.Over, info)).to.deep.equal([expected]);
        });

        it('should return undefined if the searchState is not over', () => {
            const info = {
                foundMoves: [{} as unknown as ScoredWordPlacement, {} as unknown as ScoredWordPlacement],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            expect(service['chooseMovesExpert'](SearchState.Selective, info)).to.be.undefined;
        });

        it('should add foundMoves to validMoves ', () => {
            const info = {
                foundMoves: [{} as unknown as ScoredWordPlacement, {} as unknown as ScoredWordPlacement],
                rejectedValidMoves: [],
                validMoves: [{} as unknown as ScoredWordPlacement],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
            service['chooseMovesExpert'](SearchState.Over, info);
            expect(info.validMoves.length).to.equal(3);
        });
    });

    describe('chooseMovesBeginner', () => {
        let request: WordFindingRequest;
        let scoreMap: Map<number, ScoredWordPlacement[]>;
        let info: PlacementEvaluationResults;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
            scoreMap = new Map([
                [DEFAULT_MOVE_2.score, [DEFAULT_MOVE_2, DEFAULT_MOVE_2]],
                [DEFAULT_MOVE_3.score, [DEFAULT_MOVE_3]],
                [DEFAULT_MOVE_4.score, [DEFAULT_MOVE_4, DEFAULT_MOVE_4]],
            ]);
            info = {
                foundMoves: [],
                rejectedValidMoves: [],
                validMoves: [],
                pointDistributionChance: {} as unknown as Map<number, number>,
            };
        });

        it('should call getMovesInRange', () => {
            const spy = chai.spy.on(service, 'getMovesInRange');
            service['chooseMovesBeginner'](SearchState.Over, request, info);
            expect(spy).to.have.been.called;
        });

        it('should call isMoveAccepted and return the first accepted move if in Selective state', () => {
            chai.spy.on(service, 'getMovesInRange', () => {
                return scoreMap;
            });
            const spyAcceptMove = chai.spy.on(service, 'isMoveAccepted', () => {
                return true;
            });
            expect(service['chooseMovesBeginner'](SearchState.Selective, request, info)).to.deep.equal([DEFAULT_MOVE_2]);
            expect(spyAcceptMove).to.have.been.called;
        });

        it('should add the rejected moves to rejectedValidMoves', () => {
            chai.spy.on(service, 'getMovesInRange', () => {
                return scoreMap;
            });
            const pointDistributionChance: Map<number, number> = new Map([
                [DEFAULT_MOVE_2.score, 1],
                [DEFAULT_MOVE_3.score, 2],
                [DEFAULT_MOVE_4.score, 3],
            ]);
            const expected: RejectedMove[] = [
                { acceptChance: 1, move: DEFAULT_MOVE_2 },
                { acceptChance: 1, move: DEFAULT_MOVE_2 },
                { acceptChance: 2, move: DEFAULT_MOVE_3 },
                { acceptChance: 3, move: DEFAULT_MOVE_4 },
                { acceptChance: 3, move: DEFAULT_MOVE_4 },
            ];
            chai.spy.on(service, 'isMoveAccepted', () => {
                return false;
            });
            info.pointDistributionChance = pointDistributionChance;
            expect(service['chooseMovesBeginner'](SearchState.Selective, request, info)).to.be.undefined;
            expect(info.rejectedValidMoves).to.deep.equal(expected);
        });

        it('should call getHighestAcceptChanceMove if not in Selective mode', () => {
            chai.spy.on(service, 'getMovesInRange', () => {
                return scoreMap;
            });
            chai.spy.on(service, 'isMoveAccepted', () => {
                return false;
            });
            const pointDistributionChance: Map<number, number> = new Map([
                [DEFAULT_MOVE_2.score, 1],
                [DEFAULT_MOVE_3.score, 2],
                [DEFAULT_MOVE_4.score, 3],
            ]);
            info.pointDistributionChance = pointDistributionChance;

            const spy = chai.spy.on(service, 'getHighestAcceptChanceMove');
            service['chooseMovesBeginner'](SearchState.Unselective, request, info);
            expect(spy).to.have.been.called();
        });
    });

    describe('getHighestAcceptChanceMove', () => {
        it('should return the highest chance move', () => {
            const expected: RejectedMove = { acceptChance: 4, move: BEST_MOVE };
            const rejectedMoves: RejectedMove[] = [
                { acceptChance: 1, move: DEFAULT_MOVE_2 },
                { acceptChance: 1, move: DEFAULT_MOVE_2 },
                { acceptChance: 2, move: DEFAULT_MOVE_3 },
                { acceptChance: 3, move: DEFAULT_MOVE_4 },
                expected,
                { acceptChance: 3, move: DEFAULT_MOVE_4 },
            ];
            expect(service['getHighestAcceptChanceMove'](rejectedMoves)).to.deep.equal(BEST_MOVE);
        });
    });

    describe('getMovesInRange', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should throw if there is no pointRange', () => {
            request.pointRange = undefined;
            const result = () => service['getMovesInRange'](SINGLE_VALID_MOVES, request);
            expect(result).to.Throw(NO_REQUEST_POINT_RANGE);
        });

        it('should return a map containing an array of each score ', () => {
            const expected: Map<number, ScoredWordPlacement[]> = new Map([
                [DEFAULT_MOVE_2.score, [DEFAULT_MOVE_2, DEFAULT_MOVE_2]],
                [DEFAULT_MOVE_3.score, [DEFAULT_MOVE_3]],
                [DEFAULT_MOVE_4.score, [DEFAULT_MOVE_4, DEFAULT_MOVE_4]],
            ]);
            expect(service['getMovesInRange'](DEFAULT_VALID_MOVES, request)).to.deep.equal(expected);
        });
    });

    describe('findMinFrequencyInRange', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should throw if there is no pointRange', () => {
            request.pointRange = undefined;
            const result = () => service['findMinFrequencyInRange'](request);
            expect(result).to.Throw(NO_REQUEST_POINT_RANGE);
        });

        it('should throw if there is no pointHistory', () => {
            request.pointHistory = undefined;
            const result = () => service['findMinFrequencyInRange'](request);
            expect(result).to.Throw(NO_REQUEST_POINT_HISTORY);
        });

        it('should throw if there is an invalid pointRange', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.minimum = request.pointRange!.maximum + 1;
            const result = () => service['findMinFrequencyInRange'](request);
            expect(result).to.Throw(INVALID_REQUEST_POINT_RANGE);
        });

        it('should return the correct maximum and minimum in the given range ', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.minimum = 2;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.maximum = 8;
            expect(service['findMinFrequencyInRange'](request)).to.deep.equal(1);
        });

        it('should return the correct maximum and minimum in the given range ', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.minimum = 0;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.maximum = 20;
            expect(service['findMinFrequencyInRange'](request)).to.deep.equal(1);
        });
    });

    describe('assignAcceptanceProbability', () => {
        let request: WordFindingRequest;
        beforeEach(() => {
            request = { ...DEFAULT_REQUEST };
        });

        it('should throw if there is no pointRange', () => {
            request.pointRange = undefined;
            const result = () => service['assignAcceptanceProbability'](request);
            expect(result).to.Throw(NO_REQUEST_POINT_RANGE);
        });

        it('should throw if there is no pointHistory', () => {
            request.pointHistory = undefined;
            const result = () => service['assignAcceptanceProbability'](request);
            expect(result).to.Throw(NO_REQUEST_POINT_HISTORY);
        });

        it('should throw if there is an invalid pointRange', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            request.pointRange!.minimum = request.pointRange!.maximum + 1;
            const result = () => service['assignAcceptanceProbability'](request);
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
            expect(service['assignAcceptanceProbability'](request)).to.deep.equal(expected);
        });
    });

    describe('attemptMove', () => {
        it('should call attemptMoveDirection', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stubAttemptMoveDirection = stub(service, <any>'attemptMoveDirection').returns(undefined);
            service['attemptMove'](DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK);
            assert(stubAttemptMoveDirection.calledTwice);
        });

        it('should add the ScoredWordPlacement that are valid (0)', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stubAttemptMoveDirection = stub(service, <any>'attemptMoveDirection');
            stubAttemptMoveDirection.onCall(0).returns({} as unknown as ScoredWordPlacement);
            stubAttemptMoveDirection.onCall(1).returns(undefined);
            expect(service['attemptMove'](DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK).length).to.equal(1);
            assert(stubAttemptMoveDirection.calledTwice);
        });

        it('should add the ScoredWordPlacement that are valid (1)', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stubAttemptMoveDirection = stub(service, <any>'attemptMoveDirection');
            stubAttemptMoveDirection.onCall(0).returns(undefined);
            stubAttemptMoveDirection.onCall(1).returns({} as unknown as ScoredWordPlacement);
            expect(service['attemptMove'](DEFAULT_SQUARE_PROPERTIES, SMALL_TILE_RACK).length).to.equal(1);
            assert(stubAttemptMoveDirection.calledTwice);
        });
    });

    describe('findMinimumWordLength', () => {
        it('should call navigator.moveUntil', () => {
            const spy = chai.spy.on(navigator, 'moveUntil', () => {
                return true;
            });
            service['findMinimumWordLength'](navigator);
            expect(spy).to.have.been.called;
        });

        it('should return POSITIVE_INFINITY if there is no neighbor', () => {
            navigator = navigator.switchOrientation();
            expect(service['findMinimumWordLength'](navigator)).to.equal(Number.POSITIVE_INFINITY);
        });

        it('should return the correct amount of tiles if there is a neighbor on the side', () => {
            navigator = new BoardNavigator(board, new Position(0, 1), Orientation.Horizontal);
            expect(service['findMinimumWordLength'](navigator)).to.equal(2);
        });

        it('should return the correct amount of tiles if there the center', () => {
            board.grid[2][0].isCenter = true;
            navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
            expect(service['findMinimumWordLength'](navigator)).to.equal(3);
        });

        it('should return the correct amount of tiles if there is a neighbor on the path', () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            navigator = new BoardNavigator(board, new Position(1, 4), Orientation.Vertical);
            expect(service['findMinimumWordLength'](navigator)).to.equal(3);
        });
    });

    describe('findTilesLeftLengthAtExtremity', () => {
        it('should call navigator.moveUntil', () => {
            const spy = chai.spy.on(navigator, 'moveUntil', () => {
                return true;
            });
            service['findTilesLeftLengthAtExtremity'](navigator, DEFAULT_TILES_LEFT_SIZE);
            expect(spy).to.have.been.called;
        });

        it('should return 0 if there are enough empty Squares', () => {
            navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
            expect(service['findTilesLeftLengthAtExtremity'](navigator, DEFAULT_SMALL_TILES_LEFT_SIZE)).to.equal(0);
        });

        it('should return the amount of empty Squares in the direction', () => {
            navigator = new BoardNavigator(board, new Position(0, 0), Orientation.Horizontal);
            expect(service['findTilesLeftLengthAtExtremity'](navigator, DEFAULT_TILES_LEFT_SIZE)).to.equal(
                DEFAULT_TILES_LEFT_SIZE - (board.getSize().x - 1),
            );
        });

        it('should return the amount of empty Squares in the direction', () => {
            navigator = new BoardNavigator(board, new Position(0, 2), Orientation.Vertical);
            expect(service['findTilesLeftLengthAtExtremity'](navigator, DEFAULT_TILES_LEFT_SIZE)).to.equal(DEFAULT_TILES_LEFT_SIZE - 3);
        });

        it('should return the amount of empty Squares in the direction', () => {
            navigator = new BoardNavigator(board, new Position(2, 3), Orientation.Horizontal);
            expect(service['findTilesLeftLengthAtExtremity'](navigator, DEFAULT_TILES_LEFT_SIZE)).to.equal(DEFAULT_TILES_LEFT_SIZE - 3);
        });
    });

    describe('findMoveRequirements', () => {
        it('should call findMinimumWordLength and findTilesLeftLengthAtExtremity', () => {
            const spyFindMinimumWordLength = chai.spy.on(service, 'findMinimumWordLength', () => {
                return 0;
            });
            const spyfindTilesLeftLengthAtExtremity = chai.spy.on(service, 'findTilesLeftLengthAtExtremity', () => {
                return 0;
            });
            service['findMoveRequirements'](navigator, DEFAULT_TILES_LEFT_SIZE);
            expect(spyFindMinimumWordLength).to.have.been.called;
            expect(spyfindTilesLeftLengthAtExtremity).to.have.been.called;
        });

        it('should return isPossible = false if findMinimumWordLength is POSITIVE_INFINITY ', () => {
            const spyFindMinimumWordLength = chai.spy.on(service, 'findMinimumWordLength', () => {
                return Number.POSITIVE_INFINITY;
            });
            const spyfindTilesLeftLengthAtExtremity = chai.spy.on(service, 'findTilesLeftLengthAtExtremity', () => {
                return 0;
            });
            expect(service['findMoveRequirements'](navigator, DEFAULT_TILES_LEFT_SIZE).isPossible).to.be.false;
            expect(spyFindMinimumWordLength).to.have.been.called;
            expect(spyfindTilesLeftLengthAtExtremity).not.to.have.been.called;
        });

        it('should return isPossible = false if findMinimumWordLength is too big ', () => {
            const spyFindMinimumWordLength = chai.spy.on(service, 'findMinimumWordLength', () => {
                return DEFAULT_TILES_LEFT_SIZE + 1;
            });
            const spyfindTilesLeftLengthAtExtremity = chai.spy.on(service, 'findTilesLeftLengthAtExtremity', () => {
                return 0;
            });
            expect(service['findMoveRequirements'](navigator, DEFAULT_TILES_LEFT_SIZE).isPossible).to.be.false;
            expect(spyFindMinimumWordLength).to.have.been.called;
            expect(spyfindTilesLeftLengthAtExtremity).not.to.have.been.called;
        });

        it('should return the correct moveProperties ', () => {
            const minLength = 1;
            const maxLength = 4;
            const expected = { isPossible: true, minimumLength: minLength, maximumLength: DEFAULT_TILES_LEFT_SIZE - maxLength };
            chai.spy.on(service, 'findMinimumWordLength', () => {
                return minLength;
            });
            const spyfindTilesLeftLengthAtExtremity = chai.spy.on(service, 'findTilesLeftLengthAtExtremity', () => {
                return maxLength;
            });
            expect(service['findMoveRequirements'](navigator, DEFAULT_TILES_LEFT_SIZE)).to.deep.equal(expected);
            expect(spyfindTilesLeftLengthAtExtremity).to.have.been.called.with(navigator, DEFAULT_TILES_LEFT_SIZE - minLength);
        });
    });

    describe('findSquareProperties', () => {
        it('should call findMoveRequirements twice', () => {
            const spy = chai.spy.on(service, 'findMoveRequirements');
            service['findSquareProperties'](board, DEFAULT_SQUARE_1, DEFAULT_TILES_LEFT_SIZE);
            expect(spy).to.have.been.called.twice;
        });

        it('should return the correct SquareProperties  ', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stubfindMoveRequirements = stub(service, <any>'findMoveRequirements');
            stubfindMoveRequirements.onCall(0).returns(DEFAULT_HORIZONTAL_PROPERTIES);
            stubfindMoveRequirements.onCall(1).returns(DEFAULT_VERTICAL_PROPERTIES);

            chai.spy.on(BoardNavigator, 'isEmpty', () => {
                return true;
            });
            expect(service['findSquareProperties'](board, DEFAULT_SQUARE_1, DEFAULT_TILES_LEFT_SIZE)).to.deep.equal(DEFAULT_SQUARE_PROPERTIES);
        });
    });

    describe('extractRandomSquare', () => {
        it('should remove 1 element form array and return it', () => {
            const arrayCopy: Square[] = JSON.parse(JSON.stringify(DEFAULT_SQUARE_ARRAY));
            const removedSquare = service['extractRandomSquare'](arrayCopy);
            expect(arrayCopy.length).to.equal(DEFAULT_SQUARE_ARRAY.length - 1);
            expect(DEFAULT_SQUARE_ARRAY.some((square) => JSON.stringify(square) === JSON.stringify(removedSquare))).to.be.true;
            expect(arrayCopy.includes(removedSquare)).to.be.false;
        });
    });

    describe('getCorrespondingMovePossibility', () => {
        it('should the horizontal move property if asked', () => {
            expect(service['getCorrespondingMovePossibility'](DEFAULT_SQUARE_PROPERTIES, Orientation.Horizontal)).to.deep.equal(
                DEFAULT_SQUARE_PROPERTIES.horizontal,
            );
        });

        it('should the vertical move property if asked', () => {
            expect(service['getCorrespondingMovePossibility'](DEFAULT_SQUARE_PROPERTIES, Orientation.Vertical)).to.deep.equal(
                DEFAULT_SQUARE_PROPERTIES.vertical,
            );
        });
    });

    describe('getCorrespondingMovePossibility', () => {
        it('should get the horizontal move property if asked', () => {
            expect(service['getCorrespondingMovePossibility'](DEFAULT_SQUARE_PROPERTIES, Orientation.Horizontal)).to.deep.equal(
                DEFAULT_SQUARE_PROPERTIES.horizontal,
            );
        });

        it('should get the vertical move property if asked', () => {
            expect(service['getCorrespondingMovePossibility'](DEFAULT_SQUARE_PROPERTIES, Orientation.Vertical)).to.deep.equal(
                DEFAULT_SQUARE_PROPERTIES.vertical,
            );
        });
    });

    describe('isWithinRequirements', () => {
        it('should return true if the target if within the MoveRequirements range', () => {
            expect(service['isWithinRequirements'](DEFAULT_HORIZONTAL_PROPERTIES, DEFAULT_HORIZONTAL_PROPERTIES.minimumLength)).to.be.true;
        });

        it('should return false if the target if within the MoveRequirements range', () => {
            expect(service['isWithinRequirements'](DEFAULT_HORIZONTAL_PROPERTIES, DEFAULT_HORIZONTAL_PROPERTIES.maximumLength + 1)).to.be.false;
        });
    });

    describe('updateSearchState', () => {
        it('should return SearchState.Over if the time exceeds the limit', () => {
            const OVER_DATE = new Date(Date.now() - LONG_MOVE_TIME - 100);
            expect(service['updateSearchState'](OVER_DATE)).to.deep.equal(SearchState.Over);
        });

        it('should return SearchState.Unselective if the time exceeds the limit short time limit but not the long time limit', () => {
            const UNSELECTIVE_DATE = new Date(Date.now() - QUICK_MOVE_TIME - 100);
            expect(service['updateSearchState'](UNSELECTIVE_DATE)).to.deep.equal(SearchState.Unselective);
        });

        it('should return SearchState.Selective if the time does not exceed the short time limit', () => {
            const START_DATE = new Date(Date.now());
            expect(service['updateSearchState'](START_DATE)).to.deep.equal(SearchState.Selective);
        });
    });

    describe('isMoveAccepted', () => {
        it('should not always return true if the chance is not 100%', () => {
            let result;
            let sameResult = true;
            const iterations = 100;
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const map = new Map([[2, 0.5]]);
            for (let i = 0; i < iterations; i++) {
                const tmp = service['isMoveAccepted'](2, map);
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
                const tmp = service['isMoveAccepted'](2, map);
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

    describe('getTilesCombinations', () => {
        it('should return an empty array if the rack is empty (0 tiles)', () => {
            const expected: Tile[][] = [];
            expect(service['getTilesCombinations'](EMPTY_TILE_RACK)).to.deep.equal(expected);
        });

        it('should return all combinations of the given tiles (1 tile)', () => {
            const expected: Tile[][] = [[DEFAULT_TILE_A]];
            expect(service['getTilesCombinations'](SINGLE_TILE_TILE_RACK)).to.deep.equal(expected);
        });

        it('should return all combinations of the given tiles (blank tile)', () => {
            const expected: Tile[][] = [[DEFAULT_TILE_BLANK_E]];
            expect(service['getTilesCombinations']([DEFAULT_TILE_WILD])).to.deep.equal(expected);
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
            expect(service['getTilesCombinations'](SMALL_TILE_RACK)).to.deep.equal(expected);
        });
    });

    describe('permuteTiles', () => {
        it('should result should be an empty array if the rack is empty (0 tiles)', () => {
            const expected: Tile[][] = [[]];
            const result: Tile[][] = [];
            service['permuteTiles'](EMPTY_TILE_RACK, result);
            expect(result).to.deep.equal(expected);
        });

        it('should return all combinations of the given tiles (1 tile)', () => {
            const expected: Tile[][] = [[DEFAULT_TILE_A]];
            const result: Tile[][] = [];
            service['permuteTiles'](SINGLE_TILE_TILE_RACK, result);
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
            service['permuteTiles'](SMALL_TILE_RACK, result);
            expect(result).to.deep.equal(expected);
        });
    });

    describe('getRackPermutations', () => {
        it('should call getTilesCombinations and permuteTiles', () => {
            const spyCombination = chai.spy.on(service, 'getTilesCombinations');
            const spyPermuteTiles = chai.spy.on(service, 'permuteTiles');
            service['getRackPermutations'](SINGLE_TILE_TILE_RACK);
            expect(spyCombination).to.have.been.called;
            expect(spyPermuteTiles).to.have.been.called;
        });

        it('should return an empty array if the tile rack is empty', () => {
            const expected: Tile[][] = [];
            const result: Tile[][] = service['getRackPermutations'](EMPTY_TILE_RACK);
            expect(result).to.deep.equal(expected);
        });

        it('should return an array containing the only tile in the rack', () => {
            const expected: Tile[][] = [SINGLE_TILE_TILE_RACK];
            const result: Tile[][] = service['getRackPermutations'](SINGLE_TILE_TILE_RACK);

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
            const result: Tile[][] = service['getRackPermutations'](SMALL_TILE_RACK);
            expect(result).to.deep.equal(expected);
        });

        it('should return an array containing all possible permutations of the tilerack (7)', () => {
            let expectedLength = 0;
            for (let tilesToChoose = BIG_TILE_RACK.length; tilesToChoose > 0; tilesToChoose--) {
                expectedLength += permutationAmount(BIG_TILE_RACK.length, tilesToChoose);
            }
            const result: Tile[][] = service['getRackPermutations'](BIG_TILE_RACK);
            expect(result.length).to.deep.equal(expectedLength);
        });
    });
});