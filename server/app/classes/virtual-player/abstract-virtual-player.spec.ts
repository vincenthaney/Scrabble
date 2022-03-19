/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { TEST_POINT_RANGE } from '@app/constants/virtual-player-tests-constants';
import PointRange from '@app/classes/word-finding/point-range';
import { AbstractVirtualPlayer } from './abstract-virtual-player';
import * as chai from 'chai';
import { expect } from 'chai';
class TestClass extends AbstractVirtualPlayer {
    findAction(): void {
        return;
    }

    playTurn(): void {
        return;
    }

    findPointRange(): PointRange {
        return TEST_POINT_RANGE;
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

    it('playTurn should call findAction method', () => {
        const findActionSpy = chai.spy.on(abstractPlayer, 'findAction', () => {
            return;
        });
        abstractPlayer.playTurn();
        expect(findActionSpy).to.be.called();
    });
});
