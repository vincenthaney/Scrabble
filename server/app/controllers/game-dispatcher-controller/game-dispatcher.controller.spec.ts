/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from '@app/app';
import Game from '@app/classes/game/game';
import { GameConfigData, StartMultiplayerGameData } from '@app/classes/game/game-config';
import { GameType } from '@app/classes/game/game.type';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import { HttpException } from '@app/classes/http.exception';
import Player from '@app/classes/player/player';
import { SECONDS_TO_MILLISECONDS, TIME_TO_RECONNECT } from '@app/constants/controllers-constants';
import {
    DICTIONARY_REQUIRED,
    GAME_IS_OVER,
    GAME_TYPE_REQUIRED,
    MAX_ROUND_TIME_REQUIRED,
    NAME_IS_INVALID,
    PLAYER_NAME_REQUIRED,
} from '@app/constants/controllers-errors';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { Delay } from '@app/utils/delay';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Socket } from 'socket.io';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { GameDispatcherController } from './game-dispatcher.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_NEW_PLAYER_ID = 'newPlayerId';

const DEFAULT_PLAYER_NAME = 'player';
const DEFAULT_GAME_CONFIG_DATA: GameConfigData = {
    playerName: DEFAULT_PLAYER_NAME,
    playerId: DEFAULT_PLAYER_ID,
    gameType: GameType.Classic,
    maxRoundTime: 1,
    dictionary: 'french',
};
const DEFAULT_EXCEPTION = 'exception';

describe('GameDispatcherController', () => {
    let controller: GameDispatcherController;

    beforeEach(() => {
        Container.reset();
        controller = Container.get(GameDispatcherController);
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(controller).to.exist;
    });

    it('router should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(controller.router).to.exist;
    });

    describe('configureRouter', () => {
        let expressApp: Express.Application;

        beforeEach(() => {
            const app = Container.get(Application);
            expressApp = app.app;
        });

        describe('POST /games/:playerId', () => {
            it('should return CREATED', async () => {
                chai.spy.on(controller, 'handleCreateGame', () => {});

                return supertest(expressApp).post(`/api/games/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.CREATED);
            });

            it('should return BAD_REQUEST on throw httpException', async () => {
                chai.spy.on(controller, 'handleCreateGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).post(`/api/games/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('GET /games/:playerId', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleLobbiesRequest', () => {});

                return supertest(expressApp).get(`/api/games/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller, 'handleLobbiesRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp).get(`/api/games/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/players/:playerId/join', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleJoinGame', () => {});

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/join`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleJoinGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/join`).expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/players/:playerId/accept', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleAcceptRequest', () => {});

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/accept`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleAcceptRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/accept`)
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/players/:playerId/reject', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleRejectRequest', () => {});

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/reject`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleRejectRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/reject`)
                    .expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/players/:playerId/cancel', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleCancelGame', () => {});

                return supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/cancel`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleCancelGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/cancel`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/player/:playerId/reconnect', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleReconnection', () => {});

                return supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/reconnect`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleReconnection', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/reconnect`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/player/:playerId/disconnect', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleDisconnection', () => {});

                return supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/disconnect`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleDisconnection', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/disconnect`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/player/:playerId/leave', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleLobbyLeave', () => {});

                return supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/leave`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleLobbyLeave', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/players/${DEFAULT_PLAYER_ID}/leave`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });
    });

    describe('handleReconnection', () => {
        let gameStub: SinonStubbedInstance<Game>;
        let getGameSpy: SinonStub;
        let playerStub: SinonStubbedInstance<Player>;
        let gameDispatcherStub: SinonStubbedInstance<GameDispatcherService>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let emitToSocketSpy: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let addToRoomSpy: any;

        beforeEach(() => {
            gameStub = createStubInstance(Game);
            gameDispatcherStub = createStubInstance(GameDispatcherService);
            playerStub = createStubInstance(Player);
            playerStub.id = DEFAULT_PLAYER_ID;
            playerStub.isConnected = true;
            gameDispatcherStub.createStartGameData.callsFake(() => undefined as unknown as StartMultiplayerGameData);
            getGameSpy = stub(controller['activeGameService'], 'getGame').returns(gameStub as unknown as Game);
            controller['gameDispatcherService'] = gameDispatcherStub as unknown as GameDispatcherService;
            gameStub.getRequestingPlayer.returns(playerStub);
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            addToRoomSpy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            gameStub.isGameOver.returns(false);
        });

        it('should call activeGameService.getGame', () => {
            gameStub.isGameOver.returns(false);
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            chai.assert(getGameSpy.calledOnce);
        });

        it('should call isGameOver', () => {
            gameStub.isGameOver.returns(false);
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            chai.assert(gameStub.isGameOver.calledOnce);
        });

        it('should throw GAME_IS_OVER, FORBIDDEN if game isGameOver', () => {
            gameStub.isGameOver.returns(true);
            const result = () => controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(result).to.throw(GAME_IS_OVER);
        });

        it('should call getRequestingPlayer', () => {
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            chai.assert(gameStub.getRequestingPlayer.calledOnce);
        });

        it('should call addToRoom', () => {
            gameStub.isGameOver.returns(false);
            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(addToRoomSpy).to.have.been.called();
        });

        it('should createStartGameData', () => {
            gameStub.isGameOver.returns(false);

            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            chai.assert(gameDispatcherStub.createStartGameData.calledOnce);
        });

        it('should call emit to socket', () => {
            gameStub.isGameOver.returns(false);

            controller['handleReconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_NEW_PLAYER_ID);
            expect(emitToSocketSpy).to.have.been.called();
        });
    });

    describe('handleCreateGame', () => {
        it('should return game id', () => {
            chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            chai.spy.on(controller['gameDispatcherService'], 'createMultiplayerGame', () => DEFAULT_GAME_ID);
            chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            const id = controller['handleCreateGame'](DEFAULT_GAME_CONFIG_DATA);
            expect(id).to.equal(DEFAULT_GAME_ID);
        });

        it('should call gameDispatcherService.createMultiplayerGame', () => {
            chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            const spy = chai.spy.on(controller['gameDispatcherService'], 'createMultiplayerGame', () => DEFAULT_GAME_ID);
            chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            controller['handleCreateGame'](DEFAULT_GAME_CONFIG_DATA);
            expect(spy).to.have.been.called();
        });

        it('should call socketService.addToRoom', () => {
            const spy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            chai.spy.on(controller['gameDispatcherService'], 'createMultiplayerGame', () => DEFAULT_GAME_ID);
            chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            controller['handleCreateGame'](DEFAULT_GAME_CONFIG_DATA);
            expect(spy).to.have.been.called();
        });

        it('should throw if config.playerName is undefined', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, playerName: undefined };
            expect(() => controller['handleCreateGame'](config as unknown as GameConfigData)).to.throw(PLAYER_NAME_REQUIRED);
        });

        it('should throw if config.gameType is undefined', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, gameType: undefined };
            expect(() => controller['handleCreateGame'](config as unknown as GameConfigData)).to.throw(GAME_TYPE_REQUIRED);
        });

        it('should throw if config.maxRoundTime is undefined', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, maxRoundTime: undefined };
            expect(() => controller['handleCreateGame'](config as unknown as GameConfigData)).to.throw(MAX_ROUND_TIME_REQUIRED);
        });

        it('should throw if config.dictionary is undefined', () => {
            const config = { ...DEFAULT_GAME_CONFIG_DATA, dictionary: undefined };
            expect(() => controller['handleCreateGame'](config as unknown as GameConfigData)).to.throw(DICTIONARY_REQUIRED);
        });

        it('should throw if config.playerName is invalid', () => {
            const playerName = '     ';
            const config = { ...DEFAULT_GAME_CONFIG_DATA, playerName };
            expect(() => controller['handleCreateGame'](config as unknown as GameConfigData)).to.throw(NAME_IS_INVALID);
        });
    });

    describe('handleJoinGame', () => {
        let emitSpy: unknown;
        let requestSpy: unknown;

        beforeEach(() => {
            emitSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            requestSpy = chai.spy.on(controller['gameDispatcherService'], 'requestJoinGame', () => {});
            chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            const stubSocket = createStubInstance(Socket);
            stubSocket.leave.returns();
            chai.spy.on(controller['socketService'], 'getSocket', () => {
                return stubSocket;
            });
        });

        it('should call socketService.emitToRoom', () => {
            controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(emitSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.requestJoinGame', () => {
            controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(requestSpy).to.have.been.called();
        });

        it('should throw if playerName is undefined', () => {
            expect(() => {
                controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, undefined as unknown as string);
            }).to.throw(PLAYER_NAME_REQUIRED);
        });

        it('should throw if playerName is invalid', () => {
            const playerName = '     ';
            expect(() => {
                controller['handleJoinGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, playerName);
            }).to.throw(NAME_IS_INVALID);
        });
    });

    describe('handleAcceptRequest', () => {
        let acceptSpy: unknown;
        let addToRoomSpy: unknown;
        let emitToRoomSpy: unknown;

        beforeEach(() => {
            acceptSpy = chai.spy.on(controller['gameDispatcherService'], 'acceptJoinRequest', async () => {
                return Promise.resolve({ player2: { getId: () => DEFAULT_PLAYER_ID } });
            });
            addToRoomSpy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
        });

        it('should call gameDispatcherService.acceptJoinRequest', async () => {
            await controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(acceptSpy).to.have.been.called();
        });

        it('should call socketService.addToRoom', async () => {
            await controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(addToRoomSpy).to.have.been.called();
        });

        it('should call socketService.emitToRoom', async () => {
            await controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(emitToRoomSpy).to.have.been.called();
        });

        it('should throw if playerName is undefined', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
            expect(controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME, undefined as unknown as string)).to.eventually.be.rejected;
        });
    });

    describe('handleRejectRequest', () => {
        let rejectSpy: unknown;
        let emitToSocketSpy: unknown;
        const player = new Player('id', 'name');
        const hostName = 'hostName';

        beforeEach(() => {
            rejectSpy = chai.spy.on(controller['gameDispatcherService'], 'rejectJoinRequest', () => [player, hostName]);
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
        });

        it('should call gameDispatcherService.rejectJoinRequest', () => {
            chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            controller['handleRejectRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(rejectSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.rejectJoinRequest', () => {
            chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            controller['handleRejectRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            expect(emitToSocketSpy).to.have.been.called();
        });

        it('should throw if playerName is undefined', () => {
            expect(() => controller['handleRejectRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME, undefined as unknown as string)).to.throw();
        });
    });

    describe('handleLobbiesRequest', () => {
        let getAvailableRoomsSpy: unknown;
        let addToRoomSpy: unknown;
        let emitToSocketSpy: unknown;
        const lobbyStub = createStubInstance(Room);
        lobbyStub.getId.returns('1');

        beforeEach(() => {
            chai.spy.on(controller['gameDispatcherService'], 'getLobbiesRoom', () => lobbyStub);
            getAvailableRoomsSpy = chai.spy.on(controller['gameDispatcherService'], 'getAvailableWaitingRooms', () => lobbyStub);
            addToRoomSpy = chai.spy.on(controller['socketService'], 'addToRoom', () => {});
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            controller['handleLobbiesRequest'](DEFAULT_PLAYER_ID);
        });

        it('should call gameDispatcherService.getAvailableWaitingRooms', () => {
            expect(getAvailableRoomsSpy).to.have.been.called();
        });

        it('should call socketService.addToRoom', () => {
            expect(addToRoomSpy).to.have.been.called.with(DEFAULT_PLAYER_ID, lobbyStub.getId());
        });

        it('should call socketService.emitToSocket', () => {
            expect(emitToSocketSpy).to.have.been.called();
        });
    });

    describe('handleCancelGame', () => {
        let getGameFromIdSpy: unknown;
        let emitToSocketSpy: unknown;
        let cancelGameSpy: unknown;
        let handleLobbiesUpdateSpy: unknown;
        const waitingRoomStub = createStubInstance(WaitingRoom);

        beforeEach(() => {
            getGameFromIdSpy = chai.spy.on(controller['gameDispatcherService'], 'getGameFromId', () => waitingRoomStub);
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            cancelGameSpy = chai.spy.on(controller['gameDispatcherService'], 'cancelGame', () => {});
            handleLobbiesUpdateSpy = chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            waitingRoomStub.joinedPlayer = undefined;
        });

        it('should call gameDispatcherService.getGameFromId', () => {
            controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(getGameFromIdSpy).to.have.been.called.with(DEFAULT_GAME_ID);
        });

        it('should call socketService.emitToSocket', () => {
            waitingRoomStub.joinedPlayer = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME);
            chai.spy.on(waitingRoomStub, 'getConfig', () => {
                return { player1: new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME) };
            });
            controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(emitToSocketSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.cancelGame', () => {
            controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(cancelGameSpy).to.have.been.called.with(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
        });

        it('should call handleLobbiesUpdate', () => {
            controller['handleCancelGame'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            expect(handleLobbiesUpdateSpy).to.have.been.called();
        });
    });

    describe('handleLobbyLeave', () => {
        let leaveLobbyRequestSpy: unknown;
        let emitToSocketSpy: unknown;
        let handleLobbiesUpdateSpy: unknown;

        beforeEach(() => {
            leaveLobbyRequestSpy = chai.spy.on(controller['gameDispatcherService'], 'leaveLobbyRequest', () => {
                return [DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME];
            });
            emitToSocketSpy = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            handleLobbiesUpdateSpy = chai.spy.on(controller, 'handleLobbiesUpdate', () => {});
            controller['handleLobbyLeave'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
        });

        it('should call gameDispatcherService.leaveLobbyRequest', () => {
            expect(leaveLobbyRequestSpy).to.have.been.called.with(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
        });

        it('should call socketService.emitToSocket', () => {
            expect(emitToSocketSpy).to.have.been.called();
        });

        it('should call handleLobbiesUpdate', () => {
            expect(handleLobbiesUpdateSpy).to.have.been.called();
        });
    });

    describe('handleLobbiesUpdate', () => {
        let getAvailableRoomsSpy: unknown;
        let emitToRoomSpy: unknown;
        let getLobbiesRoomSpy: unknown;
        const lobbyRoomStub = createStubInstance(Room);

        beforeEach(() => {
            getAvailableRoomsSpy = chai.spy.on(controller['gameDispatcherService'], 'getAvailableWaitingRooms', () => {});
            emitToRoomSpy = chai.spy.on(controller['socketService'], 'emitToRoom', () => {});
            getLobbiesRoomSpy = chai.spy.on(controller['gameDispatcherService'], 'getLobbiesRoom', () => {
                return lobbyRoomStub;
            });
            controller['handleLobbiesUpdate']();
        });

        it('should call gameDispatcherService.getAvailableWaitingRooms', () => {
            expect(getAvailableRoomsSpy).to.have.been.called();
        });

        it('should call socketService.emitToRoom', () => {
            expect(emitToRoomSpy).to.have.been.called();
        });

        it('should call gameDispatcherService.getLobbiesRoom', () => {
            expect(getLobbiesRoomSpy).to.have.been.called();
        });
    });

    describe('handleDisconnection', () => {
        let gameStub: SinonStubbedInstance<Game>;
        let getGameSpy: SinonStub;
        let gameIsOverSpy: unknown;
        let playerStub: SinonStubbedInstance<Player>;
        let handleLeaveSpy: unknown;

        beforeEach(() => {
            gameStub = createStubInstance(Game);
            getGameSpy = stub(controller['activeGameService'], 'getGame').returns(gameStub as unknown as Game);
            playerStub = createStubInstance(Player);
            gameStub.getRequestingPlayer.returns(playerStub);
            handleLeaveSpy = chai.spy.on(controller, 'handleLobbyLeave', () => {});
        });

        it('Disconnection should verify if game is over', () => {
            gameIsOverSpy = chai.spy.on(gameStub, 'isGameOver', () => true);
            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
            expect(getGameSpy.calledOnce).to.be.true;
            expect(gameIsOverSpy).to.have.been.called();
        });

        it('Disconnection should set player isConnected to false if the game is not over', () => {
            gameIsOverSpy = chai.spy.on(gameStub, 'isGameOver', () => false);
            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
            expect(playerStub.isConnected).to.be.false;
        });

        it('Disconnection should force player to leave if they are not reconnected after 5 seconds', () => {
            gameIsOverSpy = chai.spy.on(gameStub, 'isGameOver', () => false);
            controller['handleDisconnection'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);

            Delay.for(TIME_TO_RECONNECT * SECONDS_TO_MILLISECONDS);
            expect(handleLeaveSpy).have.been.called.with(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID);
        });
    });
});
