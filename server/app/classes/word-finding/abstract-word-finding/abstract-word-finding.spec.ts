/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { Dictionary } from '@app/classes/dictionary';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { expect } from 'chai';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import {
    BoardPlacement,
    DictionarySearcher,
    ScoredWordPlacement,
    WordFindingRequest,
    WordFindingUseCase,
    DictionarySearchResult,
    BoardPlacementsExtractor,
    PerpendicularWord,
} from '@app/classes/word-finding';
import AbstractWordFinding from './abstract-word-finding';
import Range from '@app/classes/range/range';
import { Random } from '@app/utils/random';
import { switchOrientation } from '@app/utils/switch-orientation';

type LetterValues = (LetterValue | ' ')[][];

const GRID: LetterValues = [
    // 0   1    2    3    4
    [' ', ' ', ' ', ' ', ' '], // 0
    [' ', ' ', ' ', ' ', 'X'], // 1
    [' ', ' ', 'A', 'B', 'C'], // 2
    [' ', ' ', ' ', ' ', 'Y'], // 3
    [' ', ' ', ' ', ' ', 'Z'], // 4
];
const DEFAULT_BOARD_PLACEMENT: BoardPlacement = {
    letters: [],
    perpendicularLetters: [],
    position: new Position(0, 0),
    orientation: Orientation.Horizontal,
    minSize: 0,
    maxSize: 0,
};
const DEFAULT_WORD_RESULT: DictionarySearchResult = {
    word: 'abc',
    perpendicularWords: [],
};
const DEFAULT_WORD_PLACEMENT: ScoredWordPlacement = {
    tilesToPlace: [],
    orientation: Orientation.Horizontal,
    startPosition: new Position(0, 0),
    score: 0,
};
const DEFAULT_SQUARE: Square = {
    tile: null,
    position: new Position(0, 0),
    scoreMultiplier: null,
    wasMultiplierUsed: false,
    isCenter: false,
};
const DEFAULT_TILE: Tile = {
    letter: 'A',
    value: 0,
};
const DEFAULT_PERPENDICULAR_WORD: PerpendicularWord = {
    word: 'abcd',
    distance: 1,
    connect: 1,
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

const lettersToTiles = (letters: LetterValue[]) => letters.map<Tile>((letter) => ({ letter, value: 0 }));

function* mockGenerator<T>(array: T[]): Generator<T> {
    for (const a of array) yield a;
}

class WordFindingTest extends AbstractWordFinding {
    handleWordPlacement(wordPlacement: ScoredWordPlacement): void {
        this.wordPlacements.push(wordPlacement);
    }
    isSearchCompleted(): boolean {
        return true;
    }
}

describe.only('AbstractWordFinding', () => {
    let wordFinding: AbstractWordFinding;
    let board: Board;
    let tiles: Tile[];
    let request: WordFindingRequest;
    let dictionaryStub: SinonStubbedInstance<Dictionary>;
    let scoreCalculatorStub: SinonStubbedInstance<ScoreCalculatorService>;

    beforeEach(() => {
        board = boardFromLetterValues(GRID);
        tiles = lettersToTiles(['L', 'M', 'N']);
        request = {
            useCase: 'none' as unknown as WordFindingUseCase,
        };
        dictionaryStub = createStubInstance(Dictionary);
        scoreCalculatorStub = createStubInstance(ScoreCalculatorService, {
            calculatePoints: 0,
        });
        wordFinding = new WordFindingTest(
            board,
            tiles,
            request,
            dictionaryStub as unknown as Dictionary,
            scoreCalculatorStub as unknown as ScoreCalculatorService,
        );
    });

    it('should create copy of tiles', () => {
        for (let i = 0; i < tiles.length; ++i) {
            expect(wordFinding['tiles'][i]).to.deep.equal(tiles[i]);
            expect(wordFinding['tiles'][i]).not.to.equal(tiles[i]);
        }
    });

    describe('findWords', () => {
        let convertTilesToLettersStub: SinonStub;
        let randomBoardPlacementsStub: SinonStub;
        let getAllWordsStub: SinonStub;
        let getWordPlacementStub: SinonStub;
        let validateWordPlacementStub: SinonStub;
        let handleWordPlacementStub: SinonStub;
        let isSearchCompletedStub: SinonStub;
        let wordResult: DictionarySearchResult;
        let boardPlacements: BoardPlacement[];

        beforeEach(() => {
            convertTilesToLettersStub = stub(wordFinding, 'convertTilesToLetters' as any).returns([]);
            randomBoardPlacementsStub = stub(wordFinding, 'randomBoardPlacements' as any);
            getAllWordsStub = stub(DictionarySearcher.prototype, 'getAllWords');
            getWordPlacementStub = stub(wordFinding, 'getWordPlacement' as any);
            validateWordPlacementStub = stub(wordFinding, 'validateWordPlacement' as any);
            handleWordPlacementStub = stub(wordFinding, 'handleWordPlacement' as any);
            isSearchCompletedStub = stub(wordFinding, 'isSearchCompleted' as any).returns(false);

            wordResult = { ...DEFAULT_WORD_RESULT };
            boardPlacements = [{ ...DEFAULT_BOARD_PLACEMENT }, { ...DEFAULT_BOARD_PLACEMENT }, { ...DEFAULT_BOARD_PLACEMENT }];

            getAllWordsStub.returns([wordResult]);
            randomBoardPlacementsStub.returns(mockGenerator(boardPlacements));
        });

        afterEach(() => {
            getAllWordsStub.restore();
        });

        it('should call convertTilesToLetters', () => {
            randomBoardPlacementsStub.returns([]);
            wordFinding.findWords();
            expect(convertTilesToLettersStub.called).to.be.true;
        });

        it('should call randomBoardPlacements', () => {
            randomBoardPlacementsStub.returns([]);
            wordFinding.findWords();
            expect(randomBoardPlacementsStub.called).to.be.true;
        });

        it('should call getWordPlacement with every wordResult and BoardPlacement', () => {
            validateWordPlacementStub.returns(false);

            wordFinding.findWords();

            for (const placement of boardPlacements) {
                expect(getWordPlacementStub.calledWith(wordResult, placement)).to.be.true;
            }
        });

        it('should call validateWordPlacement with every wordPlacement', () => {
            const wordPlacements: ScoredWordPlacement[] = [];

            for (let i = 0; i < boardPlacements.length; ++i) {
                const placement = { ...DEFAULT_WORD_PLACEMENT };
                wordPlacements.push(placement);
                getWordPlacementStub.onCall(i).returns(placement);
            }

            wordFinding.findWords();

            for (const placement of wordPlacements) {
                expect(validateWordPlacementStub.calledWith(placement)).to.be.true;
            }
        });

        it('should call handleWordPlacement with every wordPlacement', () => {
            validateWordPlacementStub.returns(true);
            const wordPlacements: ScoredWordPlacement[] = [];

            for (let i = 0; i < boardPlacements.length; ++i) {
                const placement = { ...DEFAULT_WORD_PLACEMENT };
                wordPlacements.push(placement);
                getWordPlacementStub.onCall(i).returns(placement);
            }

            wordFinding.findWords();

            for (const placement of wordPlacements) {
                expect(handleWordPlacementStub.calledWith(placement)).to.be.true;
            }
        });

        it('should not call handleWordPlacement if validateWordPlacement returns false', () => {
            validateWordPlacementStub.returns(false);

            wordFinding.findWords();

            expect(handleWordPlacementStub.called).to.be.false;
        });

        it('should call isSearchCompleted for every wordPlacement', () => {
            validateWordPlacementStub.returns(true);

            wordFinding.findWords();

            expect(isSearchCompletedStub.callCount).to.equal(boardPlacements.length);
        });

        it('should not continue if isSearchComplete is true', () => {
            validateWordPlacementStub.returns(true);
            isSearchCompletedStub.returns(true);

            wordFinding.findWords();

            expect(getAllWordsStub.callCount).to.equal(1);
        });
    });

    describe('isWithingPointRange', () => {
        it('should return true if no pointRange', () => {
            const score = 42;
            request.pointRange = undefined;
            expect(wordFinding['isWithinPointRange'](score)).to.be.true;
        });

        it('should call isWithinRange', () => {
            const score = 42;
            request.pointRange = new Range(0, 1);
            const isWithinRangeStub = stub(request.pointRange, 'isWithinRange');

            wordFinding['isWithinPointRange'](score);

            expect(isWithinRangeStub.calledWith(score)).to.be.true;
        });
    });

    describe('randomBoardPlacements', () => {
        let extractBoardPlacementsStub: SinonStub;
        let popRandomStub: SinonStub;

        beforeEach(() => {
            extractBoardPlacementsStub = stub(BoardPlacementsExtractor.prototype, 'extractBoardPlacements').returns([]);
            popRandomStub = stub(Random, 'popRandom').returns(undefined);
        });

        afterEach(() => {
            extractBoardPlacementsStub.restore();
            popRandomStub.restore();
        });

        it('should call extractBoardPlacements', () => {
            // eslint-disable-next-line no-unused-vars
            for (const _ of wordFinding['randomBoardPlacements']());

            expect(extractBoardPlacementsStub.called).to.be.true;
        });

        it('should call popRandom with boardPlacement', () => {
            const boardPlacements: BoardPlacement[] = [];

            // eslint-disable-next-line no-unused-vars
            for (const _ of wordFinding['randomBoardPlacements']());

            expect(popRandomStub.calledWith(boardPlacements)).to.be.true;
        });

        it('should call popRandom while it returns a value', () => {
            const n = 4;
            popRandomStub.returns(undefined);

            for (let i = 0; i < n; ++i) popRandomStub.onCall(i).returns({ ...DEFAULT_BOARD_PLACEMENT });

            // eslint-disable-next-line no-unused-vars
            for (const _ of wordFinding['randomBoardPlacements']());

            expect(popRandomStub.callCount).to.equal(n + 1);
        });
    });

    describe('getWordPlacement', () => {
        let extractWordSquareTileStub: SinonStub;
        let extractPerpendicularWordsSquareTileStub: SinonStub;
        let wordResult: DictionarySearchResult;
        let boardPlacement: BoardPlacement;

        beforeEach(() => {
            extractWordSquareTileStub = stub(wordFinding, 'extractWordSquareTile' as any).returns([[{ ...DEFAULT_SQUARE }, { ...DEFAULT_TILE }]]);
            extractPerpendicularWordsSquareTileStub = stub(wordFinding, 'extractPerpendicularWordsSquareTile' as any).returns([]);

            wordResult = { ...DEFAULT_WORD_RESULT };
            boardPlacement = { ...DEFAULT_BOARD_PLACEMENT };
        });

        it('should call extractWordSquareTile with wordResult and boardPlacement', () => {
            wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(extractWordSquareTileStub.calledWith(wordResult, boardPlacement)).to.be.true;
        });

        it('should call extractPerpendicularWordsSquareTile with wordResult and boardPlacement', () => {
            wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(extractPerpendicularWordsSquareTileStub.calledWith(wordResult, boardPlacement)).to.be.true;
        });

        it('should call calculatePoints with wordSquareTiles and perpendicularWordsSquareTiles', () => {
            const wordSquareTiles: [Square, Tile][] = [[{ ...DEFAULT_SQUARE }, { ...DEFAULT_TILE }]];
            const perpendicularWordsSquareTiles: [Square, Tile][][] = [[[{ ...DEFAULT_SQUARE }, { ...DEFAULT_TILE }]]];
            const expected = [wordSquareTiles, ...perpendicularWordsSquareTiles];

            extractWordSquareTileStub.returns(wordSquareTiles);
            extractPerpendicularWordsSquareTileStub.returns(perpendicularWordsSquareTiles);

            wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(scoreCalculatorStub.calculatePoints.calledWith(expected)).to.be.true;
        });

        it('should returns only new tiles', () => {
            const n = 2;
            const m = 5;
            const wordSquareTiles: [Square, Tile][] = [];

            for (let i = 0; i < n; ++i) {
                wordSquareTiles.push([{ ...DEFAULT_SQUARE }, { ...DEFAULT_TILE }]);
            }
            for (let i = 0; i < m - n; ++i) {
                wordSquareTiles.push([{ ...DEFAULT_SQUARE, tile: { ...DEFAULT_TILE } }, { ...DEFAULT_TILE }]);
            }

            extractWordSquareTileStub.returns(wordSquareTiles);

            const result = wordFinding['getWordPlacement'](wordResult, boardPlacement);

            for (let i = 0; i < n; ++i) {
                expect(result.tilesToPlace[i]).to.equal(wordSquareTiles[i][1]);
            }

            expect(result.tilesToPlace.length).to.equal(n);
        });

        it('should return boardPlacement orientation', () => {
            const result = wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(result.orientation).to.equal(boardPlacement.orientation);
        });

        it('should return first placed tile position', () => {
            const n = 2;
            const m = 5;
            const wordSquareTiles: [Square, Tile][] = [];

            for (let i = 0; i < m - n; ++i) {
                wordSquareTiles.push([{ ...DEFAULT_SQUARE, tile: { ...DEFAULT_TILE } }, { ...DEFAULT_TILE }]);
            }
            for (let i = 0; i < n; ++i) {
                wordSquareTiles.push([{ ...DEFAULT_SQUARE }, { ...DEFAULT_TILE }]);
            }

            extractWordSquareTileStub.returns(wordSquareTiles);

            const result = wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(result.startPosition).to.equal(wordSquareTiles[m - n][0].position);
        });

        it('should return score', () => {
            const score = 43;
            scoreCalculatorStub.calculatePoints.returns(score);

            const result = wordFinding['getWordPlacement'](wordResult, boardPlacement);

            expect(result.score).to.equal(score);
        });
    });

    describe('validateWordPlacement', () => {
        it('should call isWithinPointRangeStub with score', () => {
            const score = 44;
            const isWithinPointRangeStub = stub(wordFinding, 'isWithinPointRange' as any);
            const wordPlacement = { ...DEFAULT_WORD_PLACEMENT, score };

            wordFinding['validateWordPlacement'](wordPlacement);

            expect(isWithinPointRangeStub.calledWith(score)).to.be.true;
        });
    });

    describe('extractWordSquareTile', () => {
        it('should call extractSquareTile', () => {
            const extractSquareTileStub = stub(wordFinding, 'extractSquareTile' as any);
            const wordResult = { ...DEFAULT_WORD_RESULT };
            const boardPlacement = { ...DEFAULT_BOARD_PLACEMENT };

            wordFinding['extractWordSquareTile'](wordResult, boardPlacement);

            expect(extractSquareTileStub.calledWith(boardPlacement.position, boardPlacement.orientation, wordResult.word));
        });
    });

    describe('extractPerpendicularWordsSquareTile', () => {
        it('should call extractSquareTile for every perpendicularWord', () => {
            const extractSquareTileStub = stub(wordFinding, 'extractSquareTile' as any);
            const wordResult = {
                ...DEFAULT_WORD_RESULT,
                perpendicularWords: [
                    { ...DEFAULT_PERPENDICULAR_WORD, distance: 2 },
                    { ...DEFAULT_PERPENDICULAR_WORD, connect: 3 },
                ],
            };
            const boardPlacement = { ...DEFAULT_BOARD_PLACEMENT };

            wordFinding['extractPerpendicularWordsSquareTile'](wordResult, boardPlacement);

            for (const placement of wordResult.perpendicularWords) {
                const position = new BoardNavigator(board, boardPlacement.position, boardPlacement.orientation)
                    .forward(placement.distance)
                    .switchOrientation()
                    .backward(placement.connect).position;
                const orientation = switchOrientation(boardPlacement.orientation);

                expect(extractSquareTileStub.calledWith(position, orientation, placement.word));
            }
        });
    });
});
