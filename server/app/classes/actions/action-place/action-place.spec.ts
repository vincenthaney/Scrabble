/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ERROR_INVALID_WORD } from '@app/classes/actions/action-error';
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import { Board, Orientation, Position } from '@app/classes/board';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { Tile, TileReserve } from '@app/classes/tile';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ActionPlace } from '..';
import { ScoreComputer, WordValidator } from './action-place';

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

const EXTRACT_RETURN: [Square, Tile][][] = [
    [
        [{ ...DEFAULT_SQUARE_1 }, { ...DEFAULT_TILE_A }],
        [{ ...DEFAULT_SQUARE_2 }, { ...DEFAULT_TILE_B }],
    ],
];
const SCORE_RETURN = 1;
const UPDATE_BOARD_RETURN: (Square | undefined)[][] = [
    [
        { ...DEFAULT_SQUARE_1, tile: DEFAULT_TILE_A },
        { ...DEFAULT_SQUARE_2, tile: DEFAULT_TILE_B },
    ],
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
    let game: Game;

    beforeEach(async () => {
        gameStub = createStubInstance(Game);
        tileReserveStub = createStubInstance(TileReserve);
        boardStub = createStubInstance(Board);

        gameStub.player1 = new Player(DEFAULT_PLAYER_1.getId(), DEFAULT_PLAYER_1.name);
        gameStub.player2 = new Player(DEFAULT_PLAYER_2.getId(), DEFAULT_PLAYER_2.name);
        gameStub.player1.tiles = TILES_PLAYER_1.map((t) => ({ ...t }));
        gameStub.player2.tiles = TILES_PLAYER_1.map((t) => ({ ...t }));
        gameStub.isPlayer1.returns(true);

        tileReserveStub.getTiles.returns(GET_TILES_RETURN);
        boardStub.grid = BOARD.map((row) => row.map((s) => ({ ...s })));

        gameStub.tileReserve = tileReserveStub as unknown as TileReserve;
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
            let wordValidatorSpy: unknown;
            let scoreComputeSpy: unknown;
            let updateBoardSpy: unknown;
            let getTilesSpy: unknown;

            beforeEach(() => {
                action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
                getTilesFromPlayerSpy = chai.spy.on(ActionUtils, 'getTilesFromPlayer', () => [[...VALID_TILES_TO_PLACE], []]);
                wordExtractSpy = chai.spy.on(WordExtraction.prototype, 'extract', () => [...EXTRACT_RETURN]);
                wordValidatorSpy = chai.spy.on(WordValidator, 'validate', () => true);
                scoreComputeSpy = chai.spy.on(ScoreComputer, 'compute', () => SCORE_RETURN);
                updateBoardSpy = chai.spy.on(action, 'updateBoard', () => UPDATE_BOARD_RETURN);
                getTilesSpy = chai.spy.on(game.tileReserve, 'getTiles', () => []);
            });

            afterEach(() => {
                chai.spy.restore();
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
                expect(wordValidatorSpy).to.have.been.called();
            });

            it('should call score computer', () => {
                action.execute();
                expect(scoreComputeSpy).to.have.been.called();
            });

            it('should call board update', () => {
                action.execute();
                expect(updateBoardSpy).to.have.been.called();
            });

            it('should call get tiles', () => {
                action.execute();
                expect(getTilesSpy).to.have.been.called();
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

            it('should throw if a word is invalid', () => {
                chai.spy.restore();
                getTilesFromPlayerSpy = chai.spy.on(action, 'getTilesFromPlayer', () => [[...VALID_TILES_TO_PLACE], []]);
                wordExtractSpy = chai.spy.on(WordExtraction.prototype, 'extract', () => [...EXTRACT_RETURN]);
                wordValidatorSpy = chai.spy.on(WordValidator, 'validate', () => false);

                expect(() => action.execute()).to.throw(ERROR_INVALID_WORD);
            });
        });
    });

    describe('updateBoard', () => {
        it('should return array with changed tiles', () => {
            const action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
            const result = action.updateBoard(EXTRACT_RETURN, game);

            for (const changes of EXTRACT_RETURN) {
                for (const [square, tile] of changes) {
                    const { row, column } = square.position;
                    const resultSquare: Square = result.filter((s: Square) => s.position.row === row && s.position.column === column)[0];
                    expect(resultSquare).to.exist;
                    expect(resultSquare!.tile).to.exist;
                    expect(resultSquare!.tile!.letter).to.equal(tile.letter);
                    expect(resultSquare!.tile!.value).to.equal(tile.value);
                }
            }
        });

        it('should return an empty array if all the square are already filled', () => {
            const action = new ActionPlace(game.player1, game, VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
            const copiedExtractReturn: [Square, Tile][][] = EXTRACT_RETURN.map((row) => row.map(([square, tile]) => [{ ...square }, { ...tile }]));
            copiedExtractReturn.forEach((row) => row.forEach(([square, tile]) => (square.tile = tile)));
            const result = action.updateBoard(EXTRACT_RETURN, game);

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
});
