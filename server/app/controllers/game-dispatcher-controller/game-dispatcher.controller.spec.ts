/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { GameConfigData } from '@app/classes/game/game-config';
import { GameType } from '@app/classes/game/game.type';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import { HttpException } from '@app/classes/http.exception';
import Player from '@app/classes/player/player';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance } from 'sinon';
import { Socket } from 'socket.io';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { DICTIONARY_REQUIRED, GAME_TYPE_REQUIRED, MAX_ROUND_TIME_REQUIRED, NAME_IS_INVALID, PLAYER_NAME_REQUIRED } from './game-dispatcher-error';
import { GameDispatcherController } from './game-dispatcher.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = 'playerId';
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
        expect(controller).to.exist;
    });

    it('router should be created', () => {
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

        describe('/games/:gameId/player/:playerId/join', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleJoinGame', () => {});

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/join`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleJoinGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/join`).expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/player/:playerId/accept', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleAcceptRequest', () => {});

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/accept`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleAcceptRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/accept`).expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/player/:playerId/reject', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleRejectRequest', () => {});

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/reject`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on throw', async () => {
                chai.spy.on(controller, 'handleRejectRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/reject`).expect(StatusCodes.BAD_REQUEST);
            });
        });

        describe('/games/:gameId/player/:playerId/cancel', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleCancelGame', () => {});

                return supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/cancel`)
                    .expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleCancelGame', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/cancel`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('/games/:gameId/player/:playerId/leave', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleLobbyLeave', () => {});

                return supertest(expressApp).delete(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/leave`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw', async () => {
                chai.spy.on(controller, 'handleLobbyLeave', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp)
                    .delete(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/leave`)
                    .expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
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
            expect(controller['handleAcceptRequest'](DEFAULT_GAME_ID, DEFAULT_PLAYER_NAME, undefined as unknown as string)).to.eventually.be.rejected;
        });
    });

    describe('handleRejectRequest', () => {
        let rejectSpy: unknown;
        let emitToSocketSpy: unknown;
        const playerStub = createStubInstance(Player);
        playerStub.getId.returns('1');
        const hostName = 'hostName';

        beforeEach(() => {
            rejectSpy = chai.spy.on(controller['gameDispatcherService'], 'rejectJoinRequest', () => [playerStub, hostName]);
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
                return { player1: createStubInstance(Player) };
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
});
