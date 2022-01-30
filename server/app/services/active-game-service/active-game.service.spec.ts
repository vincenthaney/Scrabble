/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActiveGameService } from './active-game.service';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as chaiAsPromised from 'chai-as-promised';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { MultiplayerGameConfig } from '@app/classes/game/game-config';
import { GameType } from '@app/classes/game/game.type';
import * as Errors from '@app/constants/errors';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_PLAYER_1 = new Player('id1', 'player1');
const DEFAULT_PLAYER_2 = new Player('id2', 'player2');
const DEFAULT_ID = 'gameId';
const DEFAULT_MULTIPLAYER_CONFIG: MultiplayerGameConfig = {
    player: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    gameType: GameType.Classic,
    maxRoundTime: 1,
    dictionary: 'francais',
};
const DEFAULT_GAME = {
    player1: DEFAULT_PLAYER_1,
    player2: DEFAULT_PLAYER_2,
    id: DEFAULT_ID,

    getId: () => DEFAULT_ID,
};

describe('ActiveGameService', () => {
    let activeGameService: ActiveGameService;

    beforeEach(() => {
        activeGameService = new ActiveGameService();
    });

    it('should create', () => {
        expect(activeGameService).to.exist;
    });

    it('should instantiate empty activeGame list', () => {
        expect(activeGameService['activeGames']).to.exist;
        expect(activeGameService['activeGames']).to.be.empty;
    });

    describe('beginMultiplayerGame', () => {
        let spy: unknown;

        beforeEach(() => {
            spy = chai.spy.on(Game, 'createMultiplayerGame', async () => Promise.resolve(DEFAULT_GAME));
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should add a game to activeGame list', async () => {
            expect(activeGameService['activeGames']).to.be.empty;
            await activeGameService.beginMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG);
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
        });

        it('should call Game.createMultiplayerGame', async () => {
            await activeGameService.beginMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG);
            expect(spy).to.have.been.called();
        });
    });

    describe('getGame', () => {
        beforeEach(async () => {
            chai.spy.on(Game, 'createMultiplayerGame', async () => Promise.resolve(DEFAULT_GAME));
            await activeGameService.beginMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG);
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should return game with player1 ID', () => {
            expect(activeGameService.getGame(DEFAULT_ID, DEFAULT_PLAYER_1.getId())).to.exist;
        });

        it('should return game with player2 ID', () => {
            expect(activeGameService.getGame(DEFAULT_ID, DEFAULT_PLAYER_2.getId())).to.exist;
        });

        it('should throw is ID is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => activeGameService.getGame(invalidId, DEFAULT_PLAYER_1.getId())).to.throw(Errors.NO_GAME_FOUND_WITH_ID);
        });

        it('should throw is player ID is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => activeGameService.getGame(DEFAULT_ID, invalidId)).to.throw(Errors.INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('remove', () => {
        beforeEach(async () => {
            chai.spy.on(Game, 'createMultiplayerGame', async () => Promise.resolve(DEFAULT_GAME));
            await activeGameService.beginMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG);
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should remove from list with player1 ID', () => {
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
            activeGameService.remove(DEFAULT_ID, DEFAULT_PLAYER_1.getId());
            expect(activeGameService['activeGames']).to.be.empty;
        });

        it('should remove from list with player2 ID', () => {
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
            activeGameService.remove(DEFAULT_ID, DEFAULT_PLAYER_2.getId());
            expect(activeGameService['activeGames']).to.be.empty;
        });
    });
});
