/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { TEST_POINT_RANGE } from '@app/constants/virtual-player-tests-constants';
import PointRange from '@app/classes/word-finding/point-range';
import { AbstractVirtualPlayer } from './abstract-virtual-player';
import * as chai from 'chai';
import { expect, spy } from 'chai';

class TestClass extends AbstractVirtualPlayer {
    findAction(): void {
        return;
    }

    findPointRange(): PointRange {
        return TEST_POINT_RANGE;
    }
}

const gameId = 'testGameId';
const playerId = 'testPlayerId';
const playerName = 'ElScrabblo';

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
        const wordFindingServiceTest = abstractPlayer.getWordFindingService();
        expect(abstractPlayer['wordFindingService']).to.equal(wordFindingServiceTest);
    });

    it('should return true when getActiveGameService', () => {
        const activeGameServiceTest = abstractPlayer.getActiveGameService();
        expect(AbstractVirtualPlayer['activeGameService']).to.equal(activeGameServiceTest);
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
        const findActionSpy = chai.spy.on(abstractPlayer, 'findAction', () => {
            return;
        });
        abstractPlayer.playTurn();
        expect(findActionSpy).to.be.called();
    });

    it('should call findPointRange method', () => {
        const findPointRangeSpy = spy.on(abstractPlayer, 'findPointRange', () => {
            return;
        });
        abstractPlayer.generateWordFindingRequest();
        expect(findPointRangeSpy).to.have.been.called();
    });

    it('should return WordFindingRequest with correct data', () => {
        const testWordFindingRequest = abstractPlayer.generateWordFindingRequest();
        expect(testWordFindingRequest.numberOfWordsToFind).to.equal(1);
        expect(testWordFindingRequest.pointHistoric).to.deep.equal(abstractPlayer.pointHistoric);
        expect(testWordFindingRequest.pointRange).to.deep.equal(TEST_POINT_RANGE);
    });

    // TO MODIFY WHEN SEND PAYLOAD IMPLEMENTED
    it('should throw when sendPayload()', () => {
        expect(abstractPlayer.sendPayload()).to.be.undefined;
    });
});
