// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */

import { GameConfigData } from '@app/classes/game/game-config';
import { GameType } from '@app/classes/game/game.type';
import WaitingGame from '@app/classes/game/waiting-game';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as chaiAsPromised from 'chai-as-promised';
import { GameDispatcherService } from './game-dispatcher.service';
import * as GameDispatcherError from './game-dispatcher.service.error';
import * as Errors from '@app/constants/errors';

const expect = chai.expect;

// const DID_NOT_THROW = 'Did not throw error';

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
chai.use(chaiAsPromised);

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

    describe('createMultiplayerGame', () => {
        let id: string;
        let waitingGame: WaitingGame;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingGame = gameDispatcherService['waitingGames'][0];
        });

        it('should create a WaitingGame', () => {
            expect(gameDispatcherService['waitingGames']).to.have.lengthOf(1);
        });

        it('should create a WaitingGame with same config', () => {
            expect(waitingGame.getConfig().player.name).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.playerName);
            expect(waitingGame.getConfig().player.getId()).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);
            expect(waitingGame.getConfig().gameType).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.gameType);
            expect(waitingGame.getConfig().maxRoundTime).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.maxRoundTime);
            expect(waitingGame.getConfig().dictionary).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.dictionary);
        });

        it('should return game id', () => {
            expect(id).to.equal(waitingGame.getId());
        });
    });

    describe('joinMultiplayerGame', () => {
        let id: string;
        let waitingGame: WaitingGame;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingGame = gameDispatcherService['waitingGames'][0];
        });

        it('should add the player to the waiting game', () => {
            gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

            expect(waitingGame.joinedPlayer?.getId()).to.equal(DEFAULT_OPPONENT_ID);
            expect(waitingGame.joinedPlayer?.name).to.equal(DEFAULT_OPPONENT_NAME);
        });

        it('should not join if a player is already waiting', () => {
            gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

            expect(() => {
                gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID_2, DEFAULT_OPPONENT_NAME_2);
            }).to.throw(GameDispatcherError.PLAYER_ALREADY_TRYING_TO_JOIN);
        });

        it('should not join if initiating player have the same name', () => {
            expect(() => {
                gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerName);
            }).to.throw(GameDispatcherError.CANNOT_HAVE_SAME_NAME);
        });
    });

    describe('acceptMultiplayerGame', () => {
        let id: string;
        let spy: unknown;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            spy = chai.spy.on(activeGameService, 'beginMultiplayerGame', async () => Promise.resolve());
            gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
        });

        it('should remove waitingGame', async () => {
            expect(gameDispatcherService['waitingGames'].filter((g) => g.getId() === id)).to.not.be.empty;

            await gameDispatcherService.acceptMultiplayerGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

            expect(gameDispatcherService['waitingGames'].filter((g) => g.getId() === id)).to.be.empty;
        });

        it('should call beginMultiplayerGame', async () => {
            await gameDispatcherService.acceptMultiplayerGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

            expect(spy).to.have.been.called();
        });

        it(' should throw error when playerId is invalid', () => {
            const invalidId = 'invalidId';

            return expect(gameDispatcherService.acceptMultiplayerGame(id, invalidId, DEFAULT_OPPONENT_NAME)).to.be.rejectedWith(
                Errors.INVALID_PLAYER_ID_FOR_GAME,
            );
        });

        it(' should throw error when playerId is invalid', () => {
            gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

            return expect(
                gameDispatcherService.acceptMultiplayerGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME),
            ).to.be.rejectedWith(GameDispatcherError.NO_OPPONENT_IN_WAITING_GAME);
        });

        it(' should throw error when playerId is invalid', () => {
            return expect(
                gameDispatcherService.acceptMultiplayerGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME_2),
            ).to.be.rejectedWith(GameDispatcherError.OPPONENT_NAME_DOES_NOT_MATCH);
        });
    });

    describe('rejectJoinRequest', () => {
        let id: string;
        let waitingGame: WaitingGame;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingGame = gameDispatcherService['waitingGames'][0];
            gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
        });

        it('should remove joinedPlayer from waitingGame', () => {
            expect(waitingGame.joinedPlayer).to.not.be.undefined;
            gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
            expect(waitingGame.joinedPlayer).to.be.undefined;
        });

        it('should throw if playerId is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.rejectJoinRequest(id, invalidId, DEFAULT_OPPONENT_NAME)).to.throw(Errors.INVALID_PLAYER_ID_FOR_GAME);
        });

        it('should throw if no player is waiting', () => {
            gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
            expect(() => {
                return gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
            }).to.throw(GameDispatcherError.NO_OPPONENT_IN_WAITING_GAME);
        });

        it('should throw error if opponent name is incorrect', () => {
            expect(() => {
                return gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME_2);
            }).to.throw(GameDispatcherError.OPPONENT_NAME_DOES_NOT_MATCH);
        });
    });

    describe('cancelGame', () => {
        let id: string;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        });

        it('should remove waiting game from list', () => {
            gameDispatcherService.cancelGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);
            expect(gameDispatcherService['waitingGames']).to.be.empty;
        });

        it('should throw if playerId is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.cancelGame(id, invalidId)).to.throw(Errors.INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('getAvailableWaitingGames', () => {
        it('should return right amount', () => {
            const NTH_GAMES = 2;

            for (let i = 0; i < NTH_GAMES; ++i) {
                gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            }

            expect(gameDispatcherService.getAvailableWaitingGames()).to.have.lengthOf(NTH_GAMES);
        });

        it('should not return games with joined player', () => {
            const NTH_GAMES = 5;
            const NTH_JOINED = 2;

            for (let i = 0; i < NTH_GAMES; ++i) {
                const id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
                if (i < NTH_JOINED) {
                    gameDispatcherService.joinMultiplayerGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
                }
            }

            expect(gameDispatcherService.getAvailableWaitingGames()).to.have.lengthOf(NTH_GAMES - NTH_JOINED);
        });
    });

    describe('getGameFromId', () => {
        let id: string;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        });

        it('should find the waitingGame', () => {
            expect(gameDispatcherService['getGameFromId'](id)).to.exist;
        });

        it('should throw when id is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService['getGameFromId'](invalidId)).to.throw(Errors.NO_GAME_FOUND_WITH_ID);
        });
    });
});
