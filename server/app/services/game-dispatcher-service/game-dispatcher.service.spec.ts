/* eslint-disable max-lines */
// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */

import Game from '@app/classes/game/game';
import { GameConfig, GameConfigData } from '@app/classes/game/game-config';
import { GameType } from '@app/classes/game/game.type';
import WaitingRoom from '@app/classes/game/waiting-room';
import Player from '@app/classes/player/player';
import { TileReserve } from '@app/classes/tile';
import {
    CANNOT_HAVE_SAME_NAME,
    INVALID_PLAYER_ID_FOR_GAME,
    NO_GAME_FOUND_WITH_ID,
    NO_OPPONENT_IN_WAITING_GAME,
    OPPONENT_NAME_DOES_NOT_MATCH,
    PLAYER_ALREADY_TRYING_TO_JOIN,
} from '@app/constants/services-errors';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import { GameDispatcherService } from './game-dispatcher.service';
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
chai.use(chaiAsPromised);

describe('GameDispatcherService', () => {
    let gameDispatcherService: GameDispatcherService;

    beforeEach(() => {
        Container.reset();
        gameDispatcherService = Container.get(GameDispatcherService);
    });

    it('should create', () => {
        expect(gameDispatcherService).to.exist;
    });

    it('should initiate an empty WaitingRoom in list', () => {
        expect(gameDispatcherService['waitingRooms']).to.be.empty;
    });

    describe('createMultiplayerGame', () => {
        let id: string;
        let waitingRoom: WaitingRoom;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
        });

        it('should create a WaitingRoom', () => {
            expect(gameDispatcherService['waitingRooms']).to.have.lengthOf(1);
        });

        it('should create a WaitingRoom with same config', () => {
            expect(waitingRoom.getConfig().player1.name).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.playerName);
            expect(waitingRoom.getConfig().player1.id).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);
            expect(waitingRoom.getConfig().gameType).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.gameType);
            expect(waitingRoom.getConfig().maxRoundTime).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.maxRoundTime);
            expect(waitingRoom.getConfig().dictionary).to.equal(DEFAULT_MULTIPLAYER_CONFIG_DATA.dictionary);
        });

        it('should return game id', () => {
            expect(id).to.equal(waitingRoom.getId());
        });
    });

    describe('requestJoinGame', () => {
        let id: string;
        let waitingRoom: WaitingRoom;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
        });

        it('should add the player to the waiting game', () => {
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

            expect(waitingRoom.joinedPlayer?.id).to.equal(DEFAULT_OPPONENT_ID);
            expect(waitingRoom.joinedPlayer?.name).to.equal(DEFAULT_OPPONENT_NAME);
        });

        it('should not join if a player is already waiting', () => {
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);

            expect(() => {
                gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID_2, DEFAULT_OPPONENT_NAME_2);
            }).to.throw(PLAYER_ALREADY_TRYING_TO_JOIN);
        });

        it('should not join if initiating players have the same name', () => {
            expect(() => {
                gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerName);
            }).to.throw(CANNOT_HAVE_SAME_NAME);
        });
    });

    describe('acceptJoinRequest', () => {
        let id: string;
        let gameStub: SinonStubbedInstance<Game>;
        let tileReserveStub: SinonStubbedInstance<TileReserve>;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            tileReserveStub = createStubInstance(TileReserve);
            tileReserveStub.init.returns(Promise.resolve());
            gameStub = createStubInstance(Game);
            gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should remove waitingRoom', async () => {
            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.not.be.empty;

            await gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.be.empty;
        });

        it(' should throw error when playerId is invalid', () => {
            const invalidId = 'invalidId';

            return expect(gameDispatcherService.acceptJoinRequest(id, invalidId, DEFAULT_OPPONENT_NAME)).to.be.rejectedWith(
                INVALID_PLAYER_ID_FOR_GAME,
            );
        });

        it(' should throw error when playerId is invalid', () => {
            gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);

            return expect(
                gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME),
            ).to.be.rejectedWith(NO_OPPONENT_IN_WAITING_GAME);
        });

        it(' should throw error when playerId is invalid', () => {
            return expect(
                gameDispatcherService.acceptJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME_2),
            ).to.be.rejectedWith(OPPONENT_NAME_DOES_NOT_MATCH);
        });
    });

    describe('rejectJoinRequest', () => {
        let id: string;
        let waitingRoom: WaitingRoom;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
        });

        it('should remove joinedPlayer from waitingRoom', () => {
            expect(waitingRoom.joinedPlayer).to.not.be.undefined;
            gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
            expect(waitingRoom.joinedPlayer).to.be.undefined;
        });

        it('should throw if playerId is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.rejectJoinRequest(id, invalidId, DEFAULT_OPPONENT_NAME)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });

        it('should throw if no player is waiting', () => {
            gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
            expect(() => {
                return gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME);
            }).to.throw(NO_OPPONENT_IN_WAITING_GAME);
        });

        it('should throw error if opponent name is incorrect', () => {
            expect(() => {
                return gameDispatcherService.rejectJoinRequest(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId, DEFAULT_OPPONENT_NAME_2);
            }).to.throw(OPPONENT_NAME_DOES_NOT_MATCH);
        });
    });

    describe('leaveLobbyRequest', () => {
        let id: string;
        let waitingRoom: WaitingRoom;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            waitingRoom = gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)[0];
            gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
        });

        it('should remove joinedPlayer from waitingRoom', () => {
            expect(waitingRoom.joinedPlayer).to.not.be.undefined;
            gameDispatcherService.leaveLobbyRequest(id, DEFAULT_OPPONENT_ID);
            expect(waitingRoom.joinedPlayer).to.be.undefined;
        });

        it('should throw if playerId is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.leaveLobbyRequest(id, invalidId)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });

        it('should throw if player is undefined', () => {
            waitingRoom.joinedPlayer = undefined;
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.leaveLobbyRequest(id, invalidId)).to.throw(NO_OPPONENT_IN_WAITING_GAME);
        });

        it('should return the [hostPlayerId, leaverName]', () => {
            expect(gameDispatcherService.leaveLobbyRequest(id, DEFAULT_OPPONENT_ID)).to.deep.equal([
                DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId,
                DEFAULT_OPPONENT_NAME,
            ]);
        });
    });

    describe('cancelGame', () => {
        let id: string;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        });

        it('should remove waiting game from list', () => {
            gameDispatcherService.cancelGame(id, DEFAULT_MULTIPLAYER_CONFIG_DATA.playerId);
            expect(gameDispatcherService['waitingRooms'].filter((g) => g.getId() === id)).to.be.empty;
        });

        it('should throw if playerId is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService.cancelGame(id, invalidId)).to.throw(INVALID_PLAYER_ID_FOR_GAME);
        });
    });

    describe('getAvailableWaitingRooms', () => {
        it('should return right amount', () => {
            const NTH_GAMES = 2;

            for (let i = 0; i < NTH_GAMES; ++i) {
                gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
            }

            expect(gameDispatcherService.getAvailableWaitingRooms()).to.have.lengthOf(NTH_GAMES);
        });

        it('should not return games with joined player', () => {
            const NTH_GAMES = 5;
            const NTH_JOINED = 2;

            for (let i = 0; i < NTH_GAMES; ++i) {
                const id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
                if (i < NTH_JOINED) {
                    gameDispatcherService.requestJoinGame(id, DEFAULT_OPPONENT_ID, DEFAULT_OPPONENT_NAME);
                }
            }

            expect(gameDispatcherService.getAvailableWaitingRooms()).to.have.lengthOf(NTH_GAMES - NTH_JOINED);
        });
    });

    describe('getGameFromId', () => {
        let id: string;

        beforeEach(() => {
            id = gameDispatcherService.createMultiplayerGame(DEFAULT_MULTIPLAYER_CONFIG_DATA);
        });

        it('should find the waitingRoom', () => {
            expect(gameDispatcherService['getGameFromId'](id)).to.exist;
        });

        it('should throw when id is invalid', () => {
            const invalidId = 'invalidId';
            expect(() => gameDispatcherService['getGameFromId'](invalidId)).to.throw(NO_GAME_FOUND_WITH_ID);
        });
    });

    describe('isGameInWaitingRooms', () => {
        const stubPlayer: SinonStubbedInstance<Player> = createStubInstance(Player);
        const config: GameConfig = {
            player1: stubPlayer as unknown as Player,
            gameType: GameType.Classic,
            maxRoundTime: 60,
            dictionary: 'francais',
        };
        let waitingRooms: WaitingRoom[];

        beforeEach(() => {
            waitingRooms = [new WaitingRoom(config)];
            gameDispatcherService['waitingRooms'] = waitingRooms;
        });

        it('should return false if gameId is not associated to game in waitingRooms', () => {
            const gameId = 'NOT_EXISTING_ID';
            expect(gameDispatcherService.isGameInWaitingRooms(gameId)).to.be.false;
        });

        it('should return true if gameId is associated to game in waitingRooms', () => {
            const gameId = waitingRooms[0].getId();
            expect(gameDispatcherService.isGameInWaitingRooms(gameId)).to.be.true;
        });
    });
});
