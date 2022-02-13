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
import Game from '@app/classes/game/game';
import { HttpException } from '@app/classes/http.exception';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { TileReserve } from '@app/classes/tile';
import { Server } from '@app/server';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { GamePlayController } from './game-play.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_DATA: ActionData = { type: 'exchange', payload: {} };
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
    });

    describe('handlePlayAction', () => {
        let emitToSocketSpy: any;
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
            gameStub['tileReserve'] = tileReserveStub as unknown as TileReserve;
            gameStub.board = boardStub as unknown as Board;
            gameStub['id'] = DEFAULT_GAME_ID;
            gameStub.getOpponentPlayer.returns(gameStub.player2);

            emitToSocketSpy = chai.spy.on(gamePlayController['socketService'], 'emitToSocket', () => {});
            gameUpdateSpy = chai.spy.on(gamePlayController, 'gameUpdate', () => ({}));
            getGameStub = stub(ActiveGameService.prototype, 'getGame').returns(gameStub as unknown as Game);
            getIdStub = stub(Player.prototype, 'getId').returns(gameStub.player2['id']);
        });

        afterEach(() => {
            getGameStub.restore();
            getIdStub.restore();
        });

        it('should call playAction', () => {
            const spy = chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [undefined, undefined]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(spy).to.have.been.called();
        });

        it('should call gameUpdate if updateData exists', () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [{}, undefined]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(gameUpdateSpy).to.have.been.called();
        });

        it("should not call gameUpdate if updateData doesn't exist", () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [undefined, undefined]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(gameUpdateSpy).to.not.have.been.called();
        });

        it("should not call emitToSocket if feedback doesn't exist", () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [{}, undefined]);
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(emitToSocketSpy).to.not.have.been.called();
        });

        it('should call emitToScket if localPlayerFeedback exists', () => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => [
                {},
                { localPlayerFeedback: DEFAULT_FEEDBACK, opponentFeedback: DEFAULT_FEEDBACK, endGameFeedback: undefined },
            ]);
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
});
