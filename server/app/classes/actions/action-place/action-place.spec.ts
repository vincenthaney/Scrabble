/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import { Board, Orientation, Position } from '@app/classes/board';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { Tile, TileReserve } from '@app/classes/tile';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import * as chai from 'chai';
import { assert } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { ActionPlace } from '..';
import { ActionErrorsMessages } from './action-errors';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_PLAYER_1 = new Player('player-1', 'Player 1');
const DEFAULT_PLAYER_2 = new Player('player-2', 'Player 2');
const INITIAL_SCORE = DEFAULT_PLAYER_1.score;
const TILES_PLAYER_1: Tile[] = [
    { letter: 'A', value: 1 },
    { letter: 'A', value: 1 },
    { letter: 'C', value: 1 },
    { letter: '*', value: 0 },
];
const VALID_TILES_TO_PLACE: Tile[] = [
    { letter: 'A', value: 1 },
    { letter: 'F', value: 0 },
    { letter: 'C', value: 1 },
];

const DEFAULT_ORIENTATION = Orientation.Horizontal;
const CENTER = 7;
const DEFAULT_POSITION: Position = new Position(CENTER, CENTER);

const DEFAULT_TILE_A: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 3 };
const DEFAULT_SQUARE_1: Square = { tile: null, position: new Position(0, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_2: Square = { tile: null, position: new Position(1, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_CENTER: Square = { tile: null, position: new Position(1, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: true };

const EXTRACT_RETURN: [Square, Tile][][] = [
    [
        [{ ...DEFAULT_SQUARE_1 }, { ...DEFAULT_TILE_A }],
        [{ ...DEFAULT_SQUARE_2 }, { ...DEFAULT_TILE_B }],
    ],
];
const EXTRACT_RETURN_LETTERS = 2;

const EXTRACT_CENTER: [Square, Tile][][] = [
    [
        [{ ...DEFAULT_SQUARE_CENTER }, { ...DEFAULT_TILE_A }],
        [{ ...DEFAULT_SQUARE_2 }, { ...DEFAULT_TILE_B }],
    ],
];
const SCORE_RETURN = 1;
const UPDATE_BOARD_RETURN: (Square | undefined)[] = [
    { ...DEFAULT_SQUARE_1, tile: DEFAULT_TILE_A },
    { ...DEFAULT_SQUARE_2, tile: DEFAULT_TILE_B },
];
const GET_TILES_RETURN: Tile[] = [
    { letter: 'Y', value: 10 },
    { letter: 'Z', value: 10 },
];
const BOARD: Square[][] = [
    [
        { ...DEFAULT_SQUARE_1, position: new Position(0, 0) },
        { ...DEFAULT_SQUARE_1, position: new Position(1, 0) },
    ],
    [
        { ...DEFAULT_SQUARE_1, position: new Position(0, 1) },
        { ...DEFAULT_SQUARE_1, position: new Position(1, 1) },
    ],
];

describe('ActionPlace', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let tileReserveStub: SinonStubbedInstance<TileReserve>;
    let boardStub: SinonStubbedInstance<Board>;
    let wordValidatorStub: SinonStubbedInstance<WordsVerificationService>;
    let scoreCalculatorServiceStub: SinonStubbedInstance<ScoreCalculatorService>;
    let game: Game;

    beforeEach(async () => {
        gameStub = createStubInstance(Game);
        tileReserveStub = createStubInstance(TileReserve);
        boardStub = createStubInstance(Board);
        wordValidatorStub = createStubInstance(WordsVerificationService);
        scoreCalculatorServiceStub = createStubInstance(ScoreCalculatorService);

        gameStub.player1 = new Player(DEFAULT_PLAYER_1.id, DEFAULT_PLAYER_1.name);
        gameStub.player2 = new Player(DEFAULT_PLAYER_2.id, DEFAULT_PLAYER_2.name);
        gameStub.player1.tiles = TILES_PLAYER_1.map((t) => ({ ...t }));
        gameStub.player2.tiles = TILES_PLAYER_1.map((t) => ({ ...t }));
        gameStub.isPlayer1.returns(true);
        boardStub.grid = BOARD.map((row) => row.map((s) => ({ ...s })));

        // eslint-disable-next-line dot-notation
        gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;

        gameStub.board = boardStub as unknown as Board;

        game = gameStub as unknown as Game;
    });

    it('should create', () => {
        const action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
        expect(action).to.exist;
    });

    describe('execute', () => {
        describe('valid word', () => {
            let action: ActionPlace;
            let getTilesFromPlayerSpy: unknown;
            let wordExtractSpy: unknown;
            let updateBoardSpy: unknown;
            let getTilesSpy: unknown;

            let isLegalPlacementStub: SinonStub<[words: [Square, Tile][][]], boolean>;
            let wordToStringSpy: unknown;

            beforeEach(() => {
                action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
                getTilesFromPlayerSpy = chai.spy.on(ActionUtils, 'getTilesFromPlayer', () => [[...VALID_TILES_TO_PLACE], []]);

                // eslint-disable-next-line dot-notation
                action['wordValidator'] = wordValidatorStub as unknown as WordsVerificationService;
                // eslint-disable-next-line dot-notation
                action['scoreCalculator'] = scoreCalculatorServiceStub as unknown as ScoreCalculatorService;

                // eslint-disable-next-line @typescript-eslint/no-empty-function
                wordValidatorStub.verifyWords.callsFake(() => {});
                scoreCalculatorServiceStub.calculatePoints.returns(SCORE_RETURN);
                scoreCalculatorServiceStub.bonusPoints.returns(0);
                updateBoardSpy = chai.spy.on(ActionPlace.prototype, 'updateBoard', () => UPDATE_BOARD_RETURN);
                isLegalPlacementStub = stub(ActionPlace.prototype, 'isLegalPlacement').returns(true);
                wordExtractSpy = chai.spy.on(WordExtraction.prototype, 'extract', () => [...EXTRACT_RETURN]);
                getTilesSpy = chai.spy.on(game, 'getTilesFromReserve', () => GET_TILES_RETURN);
                // isABingoSpy = chai.spy.on(ActionPlace.prototype, 'isABingo', () => false);
                wordToStringSpy = chai.spy.on(ActionPlace.prototype, 'wordToString', () => []);
            });

            afterEach(() => {
                chai.spy.restore();
                isLegalPlacementStub.restore();
            });

            it('should call getTilesFromPlayer', () => {
                action.execute();
                expect(getTilesFromPlayerSpy).to.have.been.called();
            });

            it('should call word extraction', () => {
                action.execute();
                expect(wordExtractSpy).to.have.been.called();
            });

            it('should call word validator', () => {
                action.execute();
                assert(wordValidatorStub.verifyWords.calledOnce);
            });

            it('should call score computer', () => {
                action.execute();
                assert(scoreCalculatorServiceStub.calculatePoints.calledOnce);
            });

            it('should call board update', () => {
                action.execute();
                expect(updateBoardSpy).to.have.been.called();
            });

            it('should call get tiles', () => {
                action.execute();
                expect(getTilesSpy).to.have.been.called();
            });

            it('should call bonusPoints', () => {
                action.execute();
                assert(scoreCalculatorServiceStub.bonusPoints.calledOnce);
            });

            it('should call wordToString', () => {
                action.execute();
                expect(wordToStringSpy).to.have.been.called();
            });

            it('should call isLegalPlacement', () => {
                action.execute();
                assert(isLegalPlacementStub.calledOnce);
            });

            it('should throw if isLegalPlacement returns false', () => {
                isLegalPlacementStub.restore();
                isLegalPlacementStub = stub(ActionPlace.prototype, 'isLegalPlacement').returns(false);
                const result = () => action.execute();
                expect(result).to.throw(ActionErrorsMessages.ImpossibleAction);
            });

            it('should return update', () => {
                const update = action.execute();
                expect(update).to.exist;
            });

            it('should return update with player', () => {
                const update: GameUpdateData = action.execute()!;
                expect(update.player1).to.exist;
            });

            it('should return update with board', () => {
                const update: GameUpdateData = action.execute()!;
                expect(update.board).to.exist;
            });

            it('should return update with updated score', () => {
                const update: GameUpdateData = action.execute()!;
                const player: PlayerData = update.player1!;
                expect(player.score).to.equal(INITIAL_SCORE + SCORE_RETURN);
            });

            it('should return update with player 2', () => {
                gameStub.isPlayer1.returns(false);
                const update: GameUpdateData = action.execute()!;
                expect(update.player2).to.exist;
            });
        });
    });

    describe('updateBoard', () => {
        it('should return array with changed tiles', () => {
            const action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
            const result = action.updateBoard(EXTRACT_RETURN);

            for (const changes of EXTRACT_RETURN) {
                for (const [square, tile] of changes) {
                    const { row, column } = square.position;
                    const resultSquare: Square = result.filter((s: Square) => s.position.row === row && s.position.column === column)[0];
                    expect(resultSquare).to.exist;
                    expect(resultSquare!.tile).to.exist;
                    expect(resultSquare.wasMultiplierUsed).to.be.true;
                    expect(resultSquare!.tile!.letter).to.equal(tile.letter);
                    expect(resultSquare!.tile!.value).to.equal(tile.value);
                }
            }
        });

        it('should return an empty array if all the square are already filled', () => {
            const action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
            const copiedExtractReturn: [Square, Tile][][] = EXTRACT_RETURN.map((row) => row.map(([square, tile]) => [{ ...square }, { ...tile }]));
            copiedExtractReturn.forEach((row) => row.forEach(([square, tile]) => (square.tile = tile)));
            const result = action.updateBoard(EXTRACT_RETURN);

            expect(result).to.be.empty;
        });
    });

    describe('getMessage', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
        });

        it('should return message', () => {
            expect(action.getMessage()).to.exist;
        });
    });

    describe('getOpponentMessage', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
        });

        it('should return OpponentMessage', () => {
            expect(action.getOpponentMessage()).to.exist;
        });
    });

    describe('amountOfLettersInWords', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
        });

        it('should return the correct number of tiles', () => {
            expect(action.amountOfLettersInWords(EXTRACT_RETURN)).to.equal(EXTRACT_RETURN_LETTERS);
        });
    });

    describe('wordToString', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
        });

        it('should return the word', () => {
            expect(action.wordToString(EXTRACT_RETURN)).to.deep.equal(['AB']);
        });
    });

    describe('isLegalPlacement', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
        });

        it('should call amountOfLettersInWords', () => {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            const amountOfLettersInWordsStub = stub(ActionPlace.prototype, 'amountOfLettersInWords').returns(1000);
            action.isLegalPlacement(EXTRACT_RETURN);
            assert(amountOfLettersInWordsStub.calledOnce);
            amountOfLettersInWordsStub.restore();
        });
        it('should call containsCenterSquare if amountOfLettersInWords return the same amount than tileToPlace', () => {
            chai.spy.restore(ActionPlace.prototype, 'amountOfLettersInWords');
            const containsCenterSquareStub = stub(action, 'containsCenterSquare').returns(true);
            const amountOfLettersInWordsStub = stub(action, 'amountOfLettersInWords').returns(VALID_TILES_TO_PLACE.length);
            action.isLegalPlacement(EXTRACT_RETURN);
            assert(containsCenterSquareStub.calledOnce);
            containsCenterSquareStub.restore();
            amountOfLettersInWordsStub.restore();
        });
    });

    describe('containsCenterSquare', () => {
        let action: ActionPlace;

        beforeEach(() => {
            action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
        });

        it('should return true if it contains center square', () => {
            const result = action.containsCenterSquare(EXTRACT_CENTER);
            expect(result).to.be.true;
        });

        it('should return true if it contains center square', () => {
            const result = action.containsCenterSquare(EXTRACT_RETURN);
            expect(result).to.be.false;
        });
    });
});
