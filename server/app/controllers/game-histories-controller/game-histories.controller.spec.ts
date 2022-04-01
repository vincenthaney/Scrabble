/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { GameHistory, PlayerHistoryData } from '@app/classes/database/game-history';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { GameHistoriesController } from '@app/controllers/game-histories-controller/game-histories.controller';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { StatusCodes } from 'http-status-codes';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const expect = chai.expect;

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_EXCEPTION = 'exception';

const DEFAULT_WINNER_DATA: PlayerHistoryData = {
    name: 'Matildd Broussaux',
    score: 569,
    isVirtualPlayer: false,
    isWinner: true,
};

const DEFAULT_LOSER_DATA: PlayerHistoryData = {
    name: 'RaphaitLaVaisselle',
    score: 420,
    isVirtualPlayer: false,
    isWinner: false,
};

const DEFAULT_GAME_HISTORY: GameHistory = {
    startTime: new Date(),
    endTime: new Date(),
    player1Data: DEFAULT_WINNER_DATA,
    player2Data: DEFAULT_LOSER_DATA,
    gameType: GameType.Classic,
    gameMode: GameMode.Multiplayer,
    hasBeenAbandonned: false,
};

describe.only('GameHistoriesController', () => {
    let controller: GameHistoriesController;

    beforeEach(() => {
        Container.reset();
        controller = Container.get(GameHistoriesController);
    });

    it('controller should create', () => {
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

        describe('GET /gameHistories/:playerId', () => {
            it('should return OK', async () => {
                chai.spy.on(controller['gameHistoriesService'], 'getAllGameHistories', () => {
                    return [];
                });

                return supertest(expressApp).get('/api/gameHistories').expect(StatusCodes.OK);
            });

            it('should return have gameHistories attribute in body', async () => {
                chai.spy.on(controller['gameHistoriesService'], 'getAllGameHistories', () => {
                    return [DEFAULT_GAME_HISTORY];
                });

                return expect((await supertest(expressApp).get('/api/gameHistories')).body).to.have.property('gameHistories');
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller['gameHistoriesService'], 'getAllGameHistories', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp).get('/api/gameHistories').expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });

        describe('DELETE /gameHistories', () => {
            it('should return NO_CONTENT', async () => {
                chai.spy.on(controller, 'handleGameHistoriesReset', () => {
                    return;
                });

                return supertest(expressApp).delete('/api/gameHistories').expect(StatusCodes.NO_CONTENT);
            });

            it('should return INTERNAL_SERVER_ERROR on throw httpException', async () => {
                chai.spy.on(controller, 'handleGameHistoriesReset', () => {
                    throw new HttpException(DEFAULT_EXCEPTION, StatusCodes.INTERNAL_SERVER_ERROR);
                });

                return supertest(expressApp).delete('/api/gameHistories').expect(StatusCodes.INTERNAL_SERVER_ERROR);
            });
        });
    });

    describe('handleGameHistoriesReset', () => {
        it('should call socketService.emitToSocket', async () => {
            const spyResetHistories = chai.spy.on(controller['gameHistoriesService'], 'resetGameHistories', () => []);
            await controller['handleGameHistoriesReset']();
            expect(spyResetHistories).to.have.been.called();
        });
    });
});
