/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { Position } from '@app/classes/board';
import Board from '@app/classes/board/board';
import { ActionData } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import Game from '@app/classes/game/game';
import { HttpException } from '@app/classes/http.exception';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { TileReserve } from '@app/classes/tile';
import { SYSTEM_ID } from '@app/constants/game';
import { Server } from '@app/server';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { INVALID_COMMAND } from '@app/services/game-play-service/game-player-error';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { CONTENT_REQUIRED, SENDER_REQUIRED } from './game-play-controller-errors';
import { GamePlayController } from './game-play.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_INPUT = 'input';
const DEFAULT_DATA: ActionData = { type: 'exchange', payload: {}, input: DEFAULT_INPUT };
const DEFAULT_EXCEPTION = 'exception';
const DEFAULT_FEEDBACK = 'this is a feedback';
const DEFAULT_PLAYER_1 = new Player('player-1', 'Player 1');
const DEFAULT_PLAYER_2 = new Player('player-2', 'Player 2');
const DEFAULT_SQUARE_1: Square = { tile: null, position: new Position(0, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_BOARD: Square[][] = [
    [
        { ...DEFAULT_SQUARE_1, position: new Position(0, 0) },
        { ...DEFAULT_SQUARE_1, position: new Position(0, 1) },
    ],
    [
        { ...DEFAULT_SQUARE_1, position: new Position(1, 0) },
        { ...DEFAULT_SQUARE_1, position: new Position(1, 1) },
    ],
];
const DEFAULT_ERROR_MESSAGE = INVALID_COMMAND;
const DEFAULT_MESSAGE_CONTENT = 'content';

describe('GamePlayController', () => {
    let gamePlayController: GamePlayController;

    beforeEach(() => {
        Container.reset();
        gamePlayController = Container.get(GamePlayController);
    });

    it('should create', () => {
        expect(gamePlayController).to.exist;
    });

    it('router should be created', () => {
        expect(gamePlayController.router).to.exist;
    });

    describe('configureRouter', () => {
        let expressApp: Express.Application;

        beforeEach(() => {
            const app = Container.get(Application);
            expressApp = app.app;
        });

        describe('POST /games/:gameId/player/:playerId/action', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(gamePlayController, 'handlePlayAction', () => {});

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/action`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on error', async () => {
                chai.spy.on(gamePlayController, 'handlePlayAction', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/action`).expect(StatusCodes.BAD_REQUEST);
            });

            it('should call handlePlayAction', async () => {
                const spy = chai.spy.on(gamePlayController, 'handlePlayAction', () => {});

                return supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/action`)
                    .then(() => {
                        expect(spy).to.have.been.called();
                    });
            });
        });

        describe('POST /games/:gameId/player/:playerId/message', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(gamePlayController, 'handleNewMessage', () => {});

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/message`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on error', async () => {
                chai.spy.on(gamePlayController, 'handleNewMessage', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/message`)
                    .expect(StatusCodes.BAD_REQUEST);
            });

            it('should call handleNewMessage', async () => {
                const spy = chai.spy.on(gamePlayController, 'handleNewMessage', () => {});

                return supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/message`)
                    .then(() => {
                        expect(spy).to.have.been.called();
                    });
            });
        });

        describe('POST /games/:gameId/player/:playerId/error', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(gamePlayController, 'handleNewError', () => {});

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/error`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on error', async () => {
                chai.spy.on(gamePlayController, 'handleNewError', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/error`).expect(StatusCodes.BAD_REQUEST);
            });

            it('should call handleNewError', async () => {
                const spy = chai.spy.on(gamePlayController, 'handleNewError', () => {});

                return supertest(expressApp)
                    .post(`/api/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/error`)
                    .then(() => {
                        expect(spy).to.have.been.called();
                    });
            });
        });
    });

    describe('handlePlayAction', () => {
        let emitToSocketSpy: any;
        let emitToRoomSpy: any;
        let gameUpdateSpy: any;
        let getGameStub: any;
        let getIdStub: any;
        let gameStub: SinonStubbedInstance<Game>;
        let tileReserveStub: SinonStubbedInstance<TileReserve>;
        let boardStub: SinonStubbedInstance<Board>;

        beforeEach(() => {
            gameStub = createStubInstance(Game);
            tileReserveStub = createStubInstance(TileReserve);
            boardStub = createStubInstance(Board);

            gameStub.player1 = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_1.name);
            gameStub.player2 = new Player(DEFAULT_PLAYER_ID + '2', DEFAULT_PLAYER_2.name);
            boardStub.grid = DEFAULT_BOARD.map((row) => row.map((s) => ({ ...s })));
            gameStub.tileReserve = tileReserveStub as unknown as TileReserve;
            gameStub.board = boardStub as unknown as Board;
            gameStub['id'] = DEFAULT_GAME_ID;
            gameStub.getOpponentPlayer.returns(gameStub.player2);

            emitToSocketSpy = chai.spy.on(gamePlayController['socketService'], 'emitToSocket', () => {});
            emitToRoomSpy = chai.spy.on(gamePlayController['socketService'], 'emitToRoom', () => {});
            gameUpdateSpy = chai.spy.on(gamePlayController, 'gameUpdate', () => ({}));
            getGameStub = stub(ActiveGameService.prototype, 'getGame').returns(gameStub as unknown as Game);
            getIdStub = stub(Player.prototype, 'getId').returns(gameStub.player2['id']);
        });

        afterEach(() => {
            getGameStub.restore();
            getIdStub.restore();
        });

        it('should call playAction', () => {
            const spy = chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [undefined, undefined, undefined]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(spy).to.have.been.called();
        });

        it('should call emitToRoom if data.input is not empty', () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [undefined, undefined, undefined]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, {
                type: 'pass',
                payload: {},
                input: '!passer',
            });
            expect(emitToRoomSpy).to.have.been.called();
        });

        it('should NOT call emitToRoom if data.input is empty', () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [undefined, undefined, undefined]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, {
                type: 'pass',
                payload: {},
                input: '',
            });
            expect(emitToRoomSpy).to.not.have.been.called();
        });

        it('should call gameUpdate if updateData exists', () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [{}, undefined, undefined]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(gameUpdateSpy).to.have.been.called();
        });

        it("should not call gameUpdate if updateData doesn't exist", () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [undefined, undefined, undefined]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(gameUpdateSpy).to.not.have.been.called();
        });

        it("should not call emitToScket if localPlayerFeedback or opponentFeedback doesn't exist", () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [{}, undefined, undefined]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(emitToSocketSpy).to.not.have.been.called();
        });

        it('should call emitToScket if localPlayerFeedback exists', () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [{}, DEFAULT_FEEDBACK, DEFAULT_FEEDBACK]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(emitToSocketSpy).to.have.been.called.twice;
        });

        it('should throw if data.type is undefined', () => {
            expect(() =>
                gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, { payload: DEFAULT_DATA.payload } as ActionData),
            ).to.throw();
        });

        it('should throw if data.payload is undefined', () => {
            expect(() =>
                gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, { type: DEFAULT_DATA.type } as ActionData),
            ).to.throw();
        });

        it('should call emitToSocket in catch if error is generated in treatment', () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => {
                throw new Error(DEFAULT_ERROR_MESSAGE);
            });
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(emitToSocketSpy).to.have.been.called.with(DEFAULT_PLAYER_ID, 'newMessage', {
                content: DEFAULT_ERROR_MESSAGE,
                senderId: SYSTEM_ID,
            });
        });
    });

    describe('gameUpdate', () => {
        it('should call sio.to with gameId', () => {
            const appServer = Container.get(Server);
            const server = appServer['server'];
            gamePlayController['socketService'].initialize(server);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const sio = gamePlayController['socketService']['sio']!;
            const spy = chai.spy.on(sio, 'to', () => ({ emit: () => {} }));
            gamePlayController.gameUpdate(DEFAULT_GAME_ID, {} as GameUpdateData);
            expect(spy).to.have.been.called();
        });

        it('should call sio.to.emit with gameId', () => {
            const appServer = Container.get(Server);
            const server = appServer['server'];
            gamePlayController['socketService'].initialize(server);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const sio = gamePlayController['socketService']['sio']!;
            const toResponse = { emit: () => {} };
            const spy = chai.spy.on(toResponse, 'emit');
            chai.spy.on(sio, 'to', () => toResponse);
            gamePlayController.gameUpdate(DEFAULT_GAME_ID, {} as GameUpdateData);
            expect(spy).to.have.been.called();
        });
    });

    describe('handleNewMessage', () => {
        let emitToRoomSpy: any;

        beforeEach(() => {
            emitToRoomSpy = chai.spy.on(gamePlayController['socketService'], 'emitToRoom', () => {});
        });

        it('should throw if message.senderId is undefined', () => {
            expect(() => gamePlayController['handleNewMessage'](DEFAULT_GAME_ID, { content: DEFAULT_MESSAGE_CONTENT } as Message)).to.throw(
                SENDER_REQUIRED,
            );
        });

        it('should throw if message.content is undefined', () => {
            expect(() => gamePlayController['handleNewMessage'](DEFAULT_GAME_ID, { senderId: DEFAULT_PLAYER_ID } as Message)).to.throw(
                CONTENT_REQUIRED,
            );
        });

        it('should call emitToRoom if message is valid', () => {
            const validMessage: Message = {
                content: DEFAULT_MESSAGE_CONTENT,
                senderId: DEFAULT_PLAYER_ID,
            };
            gamePlayController['handleNewMessage'](DEFAULT_GAME_ID, validMessage);
            expect(emitToRoomSpy).to.have.been.called();
        });
    });

    describe('handleNewError', () => {
        let emitToRoomSpy: any;

        beforeEach(() => {
            emitToRoomSpy = chai.spy.on(gamePlayController['socketService'], 'emitToSocket', () => {});
        });

        it('should throw if message.senderId is undefined', () => {
            expect(() => gamePlayController['handleNewError'](DEFAULT_GAME_ID, { content: DEFAULT_MESSAGE_CONTENT } as Message)).to.throw(
                SENDER_REQUIRED,
            );
        });

        it('should throw if message.content is undefined', () => {
            expect(() => gamePlayController['handleNewError'](DEFAULT_GAME_ID, { senderId: DEFAULT_PLAYER_ID } as Message)).to.throw(
                CONTENT_REQUIRED,
            );
        });

        it('should call emitToRoom if message is valid', () => {
            const validMessage: Message = {
                content: DEFAULT_MESSAGE_CONTENT,
                senderId: DEFAULT_PLAYER_ID,
            };
            gamePlayController['handleNewError'](DEFAULT_GAME_ID, validMessage);
            expect(emitToRoomSpy).to.have.been.called();
        });
    });
});
