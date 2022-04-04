/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { HttpException } from '@app/classes/http-exception/http-exception';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import { afterEach } from 'mocha';
import { stub } from 'sinon';
import * as supertest from 'supertest';
import * as sinon from 'sinon';
import { Container } from 'typedi';
import { HighScoresController } from './high-scores.controller';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_PLAYER_ID = 'playerId';

const DEFAULT_EXCEPTION = 'exception';

describe('HighScoresController', () => {
    let controller: HighScoresController;

    beforeEach(() => {
        sinon.restore();
        Container.reset();
        controller = Container.get(HighScoresController);

        stub(controller['socketService'], 'removeFromRoom').callsFake(() => {
            return;
        });
        stub(controller['socketService'], 'emitToSocket').callsFake(() => {
            return;
        });
    });

    afterEach(() => {
        sinon.restore();
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

        describe('GET /highScores/:playerId', () => {
            it('should return NO_CONTENT', async () => {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                chai.spy.on(controller, 'handleHighScoresRequest', () => {});

                return supertest(expressApp).get(`/api/highScores/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller, 'handleHighScoresRequest', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp).get(`/api/highScores/${DEFAULT_PLAYER_ID}`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });
    });

    describe('handleHighScoresRequest', () => {
        it('should call socketService.emitToSocket', async () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spyEmitToSocket = chai.spy.on(controller['socketService'], 'emitToSocket', () => {});
            const spyGetAllHighScores = chai.spy.on(controller['highScoresService'], 'getAllHighScores', () => []);
            await controller['handleHighScoresRequest'](DEFAULT_PLAYER_ID);
            expect(spyEmitToSocket).to.have.been.called();
            expect(spyGetAllHighScores).to.have.been.called();
        });
    });
});
