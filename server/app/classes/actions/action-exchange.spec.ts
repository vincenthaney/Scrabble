/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { ActionExchange } from '.';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { createStubInstance, SinonStubbedInstance, assert, stub, SinonStub } from 'sinon';
import { LetterValue, Tile } from '@app/classes/tile';

const DEFAULT_PLAYER_1 = new Player('player-1', 'Player 1');
const TILES_PLAYER_1: Tile[] = [
    { letter: 'a', value: 1 },
    { letter: 'a', value: 1 },
    { letter: 'c', value: 1 },
    { letter: '*', value: 0 },
];

const VALID_TILES_TO_EXCHANGE: Tile[] = [
    { letter: 'a', value: 1 },
    { letter: '*', value: 0 },
    { letter: 'c', value: 1 },
];
const INVALID_TILES_TO_EXCHANGE_VALUE: Tile[] = [
    { letter: 'a', value: 5 },
    { letter: 'a', value: 1 },
    { letter: 'c', value: 1 },
];
const INVALID_TILES_TO_EXCHANGE_LETTER: Tile[] = [
    { letter: 'a', value: 1 },
    { letter: 'f', value: 1 },
    { letter: 'c', value: 1 },
];
const INVALID_TILES_TO_EXCHANGE_LENGTH: Tile[] = [
    { letter: 'a', value: 5 },
    { letter: 'a', value: 1 },
    { letter: 'c', value: 1 },
    { letter: 'c', value: 1 },
    { letter: 'c', value: 1 },
];
const INVALID_TILES_TO_EXCHANGE_EMPTY: Tile[] = [];

const RETURNED_TILES: Tile[] = [
    { letter: 'g', value: 1 },
    { letter: 'h', value: 2 },
    { letter: 'i', value: 3 },
];

describe('ActionPlace', () => {
    let action: ActionExchange;
    let game: SinonStubbedInstance<Game>;
    let swapStub: SinonStub<[tilesToSwap: Tile[]], Tile[]>;
    beforeEach(() => {
        game = createStubInstance(Game);
        // spy(game.tileReserve, 'swapTiles', () => { return RETURNED_TILES; });
        swapStub = stub(game.tileReserve, 'swapTiles').callsFake(() => {
            return RETURNED_TILES;
        });
        game.player1.tiles = TILES_PLAYER_1;
        // game.tileReserve.swapTiles({ return [];});
    });

    it('should create', () => {
        action = new ActionExchange(VALID_TILES_TO_EXCHANGE);
        expect(action).to.exist;
    });

    it('Should call swapTiles with the correct TileArray', () => {
        action.execute(game as unknown as Game, DEFAULT_PLAYER_1);
        assert.calledWith(swapStub, VALID_TILES_TO_EXCHANGE);

    });

    it('Should call give the correct tiles to the player', () => {
        action.execute(game as unknown as Game, DEFAULT_PLAYER_1);
        const EXPECTED_TILES: Tile[] = [{ letter: 'a' as LetterValue, value: 1 }].concat(RETURNED_TILES);
        expect(game.player1.tiles).to.deep.equal(EXPECTED_TILES);
    });

    it('Should return the correct GameDataUpdate', () => {
        const result = action.execute(game as unknown as Game, DEFAULT_PLAYER_1);
        // TODO Clarify what to specify
        const EXPECTED_TILES: Tile[] = [{ letter: 'a' as LetterValue, value: 1 }].concat(RETURNED_TILES);
        const EXPECTED_RETURN = { playerId: 'player-1', player: { tiles: EXPECTED_TILES } };
        expect(result).to.deep.equal(EXPECTED_RETURN);
    });
    const INVALID_CASES: Tile[][] = [
        INVALID_TILES_TO_EXCHANGE_VALUE,
        INVALID_TILES_TO_EXCHANGE_LETTER,
        INVALID_TILES_TO_EXCHANGE_LENGTH,
        INVALID_TILES_TO_EXCHANGE_EMPTY,
    ];

    for (const testCase of INVALID_CASES) {
        it('Should throw an INVALID_COMMAND error', () => {
            const result = () => action.execute(game as unknown as Game, DEFAULT_PLAYER_1);
            // TODO Clarify what to specify
            expect(result).to.throw(INVALID_COMMAND);
        });
    }

    describe('getMessage', () => {
        it('is not yet implemented', () => {
            expect(() => action.getMessage()).to.throw('Method not implemented.');
        });
    });

    describe('willEndTurn', () => {
        it('should not end turn', () => {
            expect(action.willEndTurn()).to.be.true;
        });
    });
});
