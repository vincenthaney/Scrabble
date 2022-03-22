/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import Game from '@app/classes/game/game';
import { ReadyGameConfig } from '@app/classes/game/game-config';
import { GameType } from '@app/classes/game/game-type';
import Player from '@app/classes/player/player';
import { INVALID_PLAYER_ID_FOR_GAME, NO_GAME_FOUND_WITH_ID } from '@app/constants/services-errors';
import BoardService from '@app/services/board-service/board.service';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { Container } from 'typedi';
import { ActiveGameService } from './active-game.service';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_PLAYER_1 = new Player('id1', 'player1');
const DEFAULT_PLAYER_2 = new Player('id2', 'player2');
const DEFAULT_ID = 'gameId';
const DEFAULT_MULTIPLAYER_CONFIG: ReadyGameConfig = {
    player1: DEFAULT_PLAYER_1,
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
    createStartGameData: () => undefined,
    areGameOverConditionsMet: () => true,
};

describe('ActiveGameService', () => {
    let activeGameService: ActiveGameService;

    beforeEach(() => {
        const boardService = Container.get(BoardService);
        activeGameService = new ActiveGameService(boardService);
    });

    it('should create', () => {
        expect(activeGameService).to.exist;
    });

    it('should instantiate empty activeGame list', () => {
        expect(activeGameService['activeGames']).to.exist;
        expect(activeGameService['activeGames']).to.be.empty;
    });

    describe('beginGame', () => {
        let spy: unknown;

        beforeEach(() => {
            spy = chai.spy.on(Game, 'createGame', async () => Promise.resolve(DEFAULT_GAME));
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should add a game to activeGame list', async () => {
            expect(activeGameService['activeGames']).to.be.empty;
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_MULTIPLAYER_CONFIG);
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
        });

        it('should call Game.createGame', async () => {
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_MULTIPLAYER_CONFIG);
            expect(spy).to.have.been.called();
        });
    });

    describe('getGame', () => {
        beforeEach(async () => {
            chai.spy.on(Game, 'createMultiplayerGame', async () => Promise.resolve(DEFAULT_GAME));
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_MULTIPLAYER_CONFIG);
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should return game with player1 ID', () => {
            expect(activeGameService.getGame(DEFAULT_ID, DEFAULT_PLAYER_1.id)).to.exist;
        });

        it('should return game with player2 ID', () => {
            expect(activeGameService.getGame(DEFAULT_ID, DEFAULT_PLAYER_2.id)).to.exist;
        });

        it('should throw is ID is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => activeGameService.getGame(invalidId, DEFAULT_PLAYER_1.id)).to.throw(NO_GAME_FOUND_WITH_ID);
        });

        it('should throw is player ID is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => activeGameService.getGame(DEFAULT_ID, invalidId)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('remove', () => {
        beforeEach(async () => {
            chai.spy.on(Game, 'createMultiplayerGame', async () => Promise.resolve(DEFAULT_GAME));
            await activeGameService.beginGame(DEFAULT_ID, DEFAULT_MULTIPLAYER_CONFIG);
        });

        afterEach(() => {
            chai.spy.restore(Game);
        });

        it('should remove from list with player1 ID', () => {
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
            activeGameService.removeGame(DEFAULT_ID, DEFAULT_PLAYER_1.id);
            expect(activeGameService['activeGames']).to.be.empty;
        });

        it('should remove from list with player2 ID', () => {
            expect(activeGameService['activeGames']).to.have.lengthOf(1);
            activeGameService.removeGame(DEFAULT_ID, DEFAULT_PLAYER_2.id);
            expect(activeGameService['activeGames']).to.be.empty;
        });
    });

    it('isGameOver should return if the game with the game id provided is over', () => {
        chai.spy.on(activeGameService, 'getGame', () => DEFAULT_GAME);
        expect(activeGameService.isGameOver(DEFAULT_ID, DEFAULT_PLAYER_1.id)).to.be.equal(DEFAULT_GAME.areGameOverConditionsMet());
    });
});
