// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */

import { GameConfigData } from '@app/classes/game/game-config';
import { GameType } from '@app/classes/game/game.type';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { GameDispatcherService } from './game-dispatcher.service';
import * as GameDispatcherError from './game-dispatcher.service.error';

const expect = chai.expect;

const DEFAULT_MULTIPLAYER_CONFIG_DATA: GameConfigData = {
    playerId: 'id',
    playerName: 'player',
    gameType: GameType.Classic,
    maxRoundTime: 1,
    dictionary: 'francais',
};

const DEFAULT_OPPONENT_ID = 'opponent_id';
const DEFAULT_OPPONENT_NAME = 'opponent';
const DEFAULT_OPPONENT_ID_2 = 'opponent_id_2';
const DEFAULT_OPPONENT_NAME_2 = 'opponent 2';

chai.use(spies);

describe('GameDispatcherService', () => {
    let activeGameService: ActiveGameService;
    let gameDispatcherService: GameDispatcherService;

    beforeEach(() => {
        activeGameService = new ActiveGameService();
        gameDispatcherService = new GameDispatcherService(activeGameService);
    });

    it('should create', () => {
        expect(gameDispatcherService).to.exist;
    });

    it('should initiate an empty WaitingRoom in list', () => {
        expect(gameDispatcherService['waitingGames']).to.be.empty;
    });

    it('createMultiplayerGame should create a WaitingGame', () => {
        gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);

        expect(gameDispatcherService['waitingGames']).to.have.lengthOf(1);
    });

    it('createMultiplayerGame should create a WaitingGame with same config', () => {
        gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        const waitingGame = gameDispatcherService['waitingGames'][0];

        expect(waitingGame.getConfig().player.name).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.playerName);
        expect(waitingGame.getConfig().player.getId()).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);
        expect(waitingGame.getConfig().gameType).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.gameType);
        expect(waitingGame.getConfig().maxRoundTime).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.maxRoundTime);
        expect(waitingGame.getConfig().dictionary).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.dictionary);
    });

    it('createMultiplayerGame should return game id', () => {
        const id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        const waitingGame = gameDispatcherService['waitingGames'][0];

        expect(id).to.equal(waitingGame.getId());
    });

    it('joinMultiplayerGame should add the player to the waiting game', () => {
        const id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
        const waitingGame = gameDispatcherService['getGameFromId'](id);

        expect(waitingGame.joinedPlayer?.getId()).to.equal(DEFAULT_OPPONENT_ID);
        expect(waitingGame.joinedPlayer?.name).to.equal(DEFAULT_OPPONENT_NAME);
    });

    it('joinMultiplayerGame should not join if a player is already waiting', () => {
        const id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

        expect(() => {
            gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID_2, DEFAULT_OPPONENT_NAME_2);
        }).to.throw(GameDispatcherError.PLAYER_ALREADY_TRYING_TO_JOIN);
    });

    it('joinMultiplayerGame should not join if initiating player have the same name', () => {
        const id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);

        expect(() => {
            gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerName);
        }).to.throw(GameDispatcherError.CANNOT_HAVE_SAME_NAME);
    });

    it('acceptMultiplayerGame should remove waitingGame', () => {
        const id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

        expect(gameDispatcherService['waitingGames'].filter((g) => g.getId() === id)).to.not.be.empty;

        chai.spy.on(activeGameService, 'beginMultiplayerGame', async () => Promise.resolve());

        gameDispatcherService.acceptMultiplayerGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

        expect(gameDispatcherService['waitingGames'].filter((g) => g.getId() === id)).to.be.empty;
    });

    it('acceptMultiplayerGame should call beginMultiplayerGame', () => {
        const id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

        const spy = chai.spy.on(activeGameService, 'beginMultiplayerGame', async () => Promise.resolve());

        gameDispatcherService.acceptMultiplayerGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

        expect(spy).to.have.been.called();
    });
});
