/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as chaiAsPromised from 'chai-as-promised';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Tile, TileReserve } from '@app/classes/tile';
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import ActionExchange from './action-exchange';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_PLAYER_1_NAME = 'player1';
const DEFAULT_PLAYER_1_ID = '1';
const PLAYER_TILES: Tile[] = [
    { letter: 'A', value: 0 },
    { letter: 'B', value: 0 },
    { letter: 'C', value: 0 },
];

describe('ActionExchange', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let tileReserveStub: SinonStubbedInstance<TileReserve>;
    let game: Game;
    let getTilesFromPlayerStub: SinonStub;

    beforeEach(() => {
        gameStub = createStubInstance(Game);
        tileReserveStub = createStubInstance(TileReserve);
        getTilesFromPlayerStub = stub(ActionUtils, 'getTilesFromPlayer');

        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, DEFAULT_PLAYER_1_NAME);
        gameStub.player1.tiles = PLAYER_TILES.map((t) => ({ ...t }));

        gameStub.tileReserve = tileReserveStub as unknown as TileReserve;
        game = gameStub as unknown as Game;
    });

    afterEach(() => {
        getTilesFromPlayerStub.restore();
    });

    describe('execute', () => {
        it('should call getTilesFromPlayer', () => {
            getTilesFromPlayerStub.returns([game.player1.tiles, []]);
            tileReserveStub.swapTiles.returns([]);

            const action = new ActionExchange(game.player1, game, []);
            action.execute();

            expect(getTilesFromPlayerStub.called).to.be.true;
        });

        it('should call swapTiles', () => {
            getTilesFromPlayerStub.returns([game.player1.tiles, []]);
            tileReserveStub.swapTiles.returns([]);

            const action = new ActionExchange(game.player1, game, []);
            action.execute();

            expect(tileReserveStub.swapTiles.called).to.be.true;
        });

        it('should return a player with tiles', () => {
            const tilesToExchange = [PLAYER_TILES[1]];
            const tilesNotToExchange = [PLAYER_TILES[0], PLAYER_TILES[2]];
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];

            getTilesFromPlayerStub.returns([tilesToExchange, tilesNotToExchange]);
            tileReserveStub.swapTiles.returns(tilesToReceive);
            gameStub.isPlayer1.returns(true);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(result.player1).to.exist;
            expect(result.player1!.tiles).to.exist;
        });

        it('should return a player with tiles (player 2)', () => {
            const tilesToExchange = [PLAYER_TILES[1]];
            const tilesNotToExchange = [PLAYER_TILES[0], PLAYER_TILES[2]];
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];

            getTilesFromPlayerStub.returns([tilesToExchange, tilesNotToExchange]);
            tileReserveStub.swapTiles.returns(tilesToReceive);
            gameStub.isPlayer1.returns(false);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(result.player2).to.exist;
            expect(result.player2!.tiles).to.exist;
        });

        it('should return a player with same amount as before', () => {
            const tilesToExchange = [PLAYER_TILES[1]];
            const tilesNotToExchange = [PLAYER_TILES[0], PLAYER_TILES[2]];
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];
            const initialTilesAmount = game.player1.tiles.length;

            getTilesFromPlayerStub.returns([tilesToExchange, tilesNotToExchange]);
            tileReserveStub.swapTiles.returns(tilesToReceive);
            gameStub.isPlayer1.returns(true);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(result.player1!.tiles!.length).to.equal(initialTilesAmount);
        });

        it('should return a player with not exchanged tiles', () => {
            const tilesToExchange = [PLAYER_TILES[1]];
            const tilesNotToExchange = [PLAYER_TILES[0], PLAYER_TILES[2]];
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];

            getTilesFromPlayerStub.returns([tilesToExchange, tilesNotToExchange]);
            tileReserveStub.swapTiles.returns(tilesToReceive);
            gameStub.isPlayer1.returns(true);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(tilesNotToExchange.every((t) => result.player1!.tiles!.some((t2) => t.letter === t2.letter && t.value === t2.value))).to.be.true;
        });

        it('should return a player with new tiles', () => {
            const tilesToExchange = [PLAYER_TILES[1]];
            const tilesNotToExchange = [PLAYER_TILES[0], PLAYER_TILES[2]];
            const tilesToReceive: Tile[] = [{ letter: 'Z', value: 0 }];

            getTilesFromPlayerStub.returns([tilesToExchange, tilesNotToExchange]);
            tileReserveStub.swapTiles.returns(tilesToReceive);
            gameStub.isPlayer1.returns(true);

            const action = new ActionExchange(game.player1, game, []);
            const result = action.execute();

            expect(tilesToReceive.every((t) => result.player1!.tiles!.some((t2) => t.letter === t2.letter && t.value === t2.value))).to.be.true;
        });
    });

    describe('getMessage', () => {
        let action: ActionExchange;

        beforeEach(() => {
            action = new ActionExchange(game.player1, game, []);
        });

        it('should return message', () => {
            expect(action.getMessage()).to.exist;
        });
    });
});
