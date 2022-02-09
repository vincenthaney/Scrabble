/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as chaiAsPromised from 'chai-as-promised';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { GamePlayController } from './game-play.controller';
import { Application } from '@app/app';
import { StatusCodes } from 'http-status-codes';
import { ActionData } from '@app/classes/communication/action-data';
import { Server } from '@app/server';
import { HttpException } from '@app/classes/http.exception';
import { GameUpdateData } from '@app/classes/communication/game-update-data';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_DATA: ActionData = { type: 'exchange', payload: {} };
const DEFAULT_EXCEPTION = 'exception';

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

                return supertest(expressApp).post(`/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/action`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on error', async () => {
                chai.spy.on(gamePlayController, 'handlePlayAction', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.BAD_REQUEST);
                });

                return supertest(expressApp).post(`/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/action`).expect(StatusCodes.BAD_REQUEST);
            });

            it('should call handlePlayAction', async () => {
                const spy = chai.spy.on(gamePlayController, 'handlePlayAction', () => {});

                return supertest(expressApp)
                    .post(`/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/action`)
                    .then(() => {
                        expect(spy).to.have.been.called();
                    });
            });
        });
    });

    describe('handlePlayAction', () => {
        it('should call playAction', () => {
            const spy = chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => ({}));
            chai.spy.on(gamePlayController, 'gameUpdate', () => ({}));
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(spy).to.have.been.called();
        });

        it('should call gameUpdate if updateData exists', () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => ({}));
            const spy = chai.spy.on(gamePlayController, 'gameUpdate', () => ({}));
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(spy).to.have.been.called();
        });

        it("should not call gameUpdate if updateData doesn't exists", () => {
            chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => undefined);
            const spy = chai.spy.on(gamePlayController, 'gameUpdate', () => ({}));
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(spy).to.not.have.been.called();
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
