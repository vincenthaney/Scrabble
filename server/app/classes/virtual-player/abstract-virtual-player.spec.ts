/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { TEST_POINT_RANGE } from '@app/constants/virtual-player-tests-constants';
import { AbstractVirtualPlayer } from './abstract-virtual-player';
import * as chai from 'chai';
import { expect } from 'chai';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import Range from '@app/classes/range/range';

class TestClass extends AbstractVirtualPlayer {
    findAction(): void {
        return;
    }

    playTurn(): void {
        return;
    }

    findPointRange(): Range {
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

    it('should return virtualPlayerService', () => {
        expect(abstractPlayer.getVirtualPlayerService() instanceof VirtualPlayerService).to.be.true;
    });
});
