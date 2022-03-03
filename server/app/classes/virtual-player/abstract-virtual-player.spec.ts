/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { TEST_MAXIMUM_VALUE, TEST_MINIMUM_VALUE } from '@app/constants/virtual-player-tests-constants';
import PointRange from '@app/classes/word-finding/point-range';
import { AbstractVirtualPlayer } from './abstract-virtual-player';
import * as chai from 'chai';
import { expect, spy } from 'chai';

class TestClass extends AbstractVirtualPlayer {
    findAction(): void {
        throw new Error('This is a test method');
    }

    findPointRange(): PointRange {
        return {
            minimum: TEST_MINIMUM_VALUE,
            maximum: TEST_MAXIMUM_VALUE,
        };
    }
}

const gameId = 'testGameId';
const playerId = 'testPlayerId';
const playerName = 'ElScrabblo';
const testPointRange: PointRange = {
    minimum: TEST_MINIMUM_VALUE,
    maximum: TEST_MAXIMUM_VALUE,
};

describe('AbstractVirtualPlayer', () => {
    let abstractPlayer: TestClass;

    beforeEach(async () => {
        abstractPlayer = new TestClass(gameId, playerId, playerName);
    });

    afterEach(() => {
        chai.spy.restore();
    });

    it('should create', () => {
        expect(abstractPlayer).to.exist;
    });

    it('should return true when getWordFindingService', () => {
        const wordFindingServiceTest = AbstractVirtualPlayer.getWordFindingService();
        expect(AbstractVirtualPlayer.wordFindingService === wordFindingServiceTest);
    });

    it('should return true when getActiveGameService', () => {
        const activeGameServiceTest = AbstractVirtualPlayer.getActiveGameService();
        expect(AbstractVirtualPlayer.activeGameService === activeGameServiceTest);
    });

    // // NOT COMPLETE
    // it('should inject class with WordFindingService', () => {
    //     const activeGameServiceTest = AbstractVirtualPlayer.getActiveGameService();
    //     expect(false).to.be.true;
    // });
    // // NOT COMPLETE
    // it('should inject class with ActiveGameService', () => {
    //     const activeGameServiceTest = AbstractVirtualPlayer.getActiveGameService();
    //     expect(false).to.be.true;
    // });

    it('should call findAction method', () => {
        const findActionSpy = spy.on(abstractPlayer, 'findAction').and.callFake();
        abstractPlayer.playTurn();
        expect(findActionSpy).to.have.been.called();
    });

    it('should call findPointRange method', () => {
        const findPointRangeSpy = spy.on(abstractPlayer, 'findPointRange').and.callFake();
        abstractPlayer.generateWordFindingRequest();
        expect(findPointRangeSpy).to.have.been.called();
    });

    it('should return WordFindingRequest with correct data', () => {
        const testWordFindingRequest = abstractPlayer.generateWordFindingRequest();
        expect(testWordFindingRequest.numberOfWordsToFind === 1).to.be.true;
        expect(testWordFindingRequest.pointHistoric === abstractPlayer.pointHistoric);
        expect(testWordFindingRequest.pointRange === testPointRange);
    });

    // TO MODIFY WHEN SEND PAYLOAD IMPLEMENTED
    it('should call findPointRange method', () => {
        expect(abstractPlayer.sendPayload()).to.throw();
    });
});
