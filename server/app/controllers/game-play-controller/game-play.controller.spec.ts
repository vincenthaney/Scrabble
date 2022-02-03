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

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_DATA: ActionData = { type: 'exchange', payload: {} };

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
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                chai.spy.on(gamePlayController, 'handlePlayAction', () => {});

                return supertest(expressApp).post(`/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/action`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return BAD_REQUEST on error', async () => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                chai.spy.on(gamePlayController, 'handlePlayAction', () => {
                    throw new Error();
                });

                return supertest(expressApp).post(`/games/${DEFAULT_GAME_ID}/player/${DEFAULT_PLAYER_ID}/action`).expect(StatusCodes.BAD_REQUEST);
            });

            it('should call handlePlayAction', async () => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
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
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(gamePlayController['gamePlayService'], 'playAction', () => {});
            gamePlayController['handlePlayAction'](DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_DATA);
            expect(spy).to.have.been.called();
        });
    });
});
