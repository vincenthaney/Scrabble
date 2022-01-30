/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as chaiAsPromised from 'chai-as-promised';
import Game from './game';
import { GameType } from './game.type';
import TileReserve from '@app/classes/tile/tile-reserve';
import Player from '@app/classes/player/player';
import { MultiplayerGameConfig } from './game-config';
// import { Tile } from '@app/classes/tile';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_PLAYER_1 = new Player('id1', 'player1');
const DEFAULT_PLAYER_2 = new Player('id2', 'player2');
const DEFAULT_MULTIPLAYER_CONFIG: MultiplayerGameConfig = {
    player: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    gameType: GameType.Classic,
    maxRoundTime: 1,
    dictionary: 'francais',
};
// const DEFAULT_TILE: Tile = { }

describe('Game', () => {
    let defaultInit: () => Promise<void>;
    let spy: unknown;

    beforeEach(() => {
        defaultInit = TileReserve.prototype.init;
        TileReserve.prototype.init = async function () {
            this['initialized'] = true;
            return Promise.resolve();
        };
        spy = chai.spy(TileReserve.prototype.init);
    });

    afterEach(() => {
        TileReserve.prototype.init = defaultInit;
    });

    describe('createMultiplayerGame', () => {
        let game: Game;

        beforeEach(async () => {
            game = await Game.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG);
        });

        it('should create', async () => {
            console.log(game);
            expect(game).to.exist;
        });

        it('should call TileReserve init', () => {
            expect(spy).to.be.called();
        });
    });
});

describe('Game Type', () => {
    it('should contain Classic', () => {
        expect(GameType.Classic).to.equal('Classique');
    });

    it('should contain Classic', () => {
        expect(GameType.LOG2990).to.equal('LOG2990');
    });
});
