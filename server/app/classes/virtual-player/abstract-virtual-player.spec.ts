/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { GAME_ID, PLAYER_ID, TEST_POINT_RANGE } from '@app/constants/virtual-player-tests-constants';
import { AbstractVirtualPlayer } from './abstract-virtual-player';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import Range from '@app/classes/range/range';
import { ActionData } from '@app/classes/communication/action-data';
import { ActionPass } from '@app/classes/actions';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { Delay } from '@app/utils/delay';
import { createStubInstance } from 'sinon';
import { Board } from '@app/classes/board';
import Game from '@app/classes/game/game';
import { LetterValue } from '@app/classes/tile';

class TestClass extends AbstractVirtualPlayer {
    async findAction(): Promise<ActionData> {
        return ActionPass.createActionData();
    }

    findPointRange(): Range {
        return TEST_POINT_RANGE;
    }

    alternativeMove(): ActionData {
        return ActionPass.createActionData();
    }
}

const playerId = 'testPlayerId';
const playerName = 'ElScrabblo';

describe('AbstractVirtualPlayer', () => {
    let abstractPlayer: TestClass;

    beforeEach(async () => {
        abstractPlayer = new TestClass(playerId, playerName);
    });

    afterEach(() => {
        chai.spy.restore();
    });

    it('should create', () => {
        expect(abstractPlayer).to.exist;
    });

    it('should return true when getWordFindingService', () => {
        const wordFindingServiceTest = abstractPlayer.getWordFindingService();
        expect(abstractPlayer['wordFindingService']).to.equal(wordFindingServiceTest);
    });

    it('should return true when getActiveGameService', () => {
        const activeGameServiceTest = abstractPlayer.getActiveGameService();
        expect(abstractPlayer['activeGameService']).to.equal(activeGameServiceTest);
    });

    it('should return virtualPlayerService', () => {
        expect(abstractPlayer.getVirtualPlayerService() instanceof VirtualPlayerService).to.be.true;
    });

    describe('playTurn', async () => {
        let actionPassSpy: unknown;
        let sendActionSpy: unknown;
        beforeEach(() => {
            spy.on(Delay, 'for', () => {
                return;
            });
            spy.on(abstractPlayer, 'findAction', () => {
                return;
            });
            actionPassSpy = spy.on(ActionPass, 'createActionData');
            sendActionSpy = spy.on(abstractPlayer['virtualPlayerService'], 'sendAction');
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should send actionPass when no words are found', async () => {
            await abstractPlayer['playTurn']();

            expect(sendActionSpy).to.have.been.called();
            expect(actionPassSpy).to.have.been.called();
        });

        it('should send action returned by findAction when no words are found', async () => {
            spy.on(Promise, 'race', () => {
                return ['testArray'];
            });
            await abstractPlayer['playTurn']();

            expect(sendActionSpy).to.have.been.called();
            expect(actionPassSpy).to.not.have.been.called();
        });
    });

    describe('getGameBoard', () => {
        it('should call getGame', () => {
            const activeGameServiceStub = createStubInstance(ActiveGameService);
            abstractPlayer['activeGameService'] = activeGameServiceStub as unknown as ActiveGameService;

            const testBoard = {} as unknown as Board;
            const getGameSpy = spy.on(abstractPlayer['activeGameService'], 'getGame', () => {
                return testBoard;
            });
            abstractPlayer['getGameBoard'](GAME_ID, PLAYER_ID);
            expect(getGameSpy).to.have.been.called();
        });
    });

    describe('isExchangePossible', () => {
        let TEST_GAME: Game;
        let TEST_MAP: Map<LetterValue, number>;
        beforeEach(() => {
            TEST_GAME = new Game();

            spy.on(abstractPlayer['activeGameService'], 'getGame', () => {
                return TEST_GAME;
            });
            spy.on(TEST_GAME, 'getTilesLeftPerLetter', () => {
                return TEST_MAP;
            });
        });
        it('should return false when tiles count is below MINIMUM_EXCHANGE_WORD_COUNT', () => {
            TEST_MAP = new Map<LetterValue, number>([
                ['A', 2],
                ['B', 2],
            ]);
            expect(abstractPlayer['isExchangePossible']()).to.be.false;
        });

        it('should return true when tiles count is above or equal to MINIMUM_EXCHANGE_WORD_COUNT', () => {
            TEST_MAP = new Map<LetterValue, number>([
                ['A', 3],
                ['B', 3],
                ['C', 3],
            ]);
            expect(abstractPlayer['isExchangePossible']()).to.be.true;
        });
    });
});
