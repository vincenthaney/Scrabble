/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { TEST_POINT_RANGE } from '@app/constants/virtual-player-tests-constants';
import PointRange from '@app/classes/word-finding/point-range';
import { AbstractVirtualPlayer } from './abstract-virtual-player';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import WordFindingUseCase from '@app/classes/word-finding/word-finding-use-case';

class TestClass extends AbstractVirtualPlayer {
    findAction(): void {
        return;
    }

    findPointRange(): PointRange {
        return TEST_POINT_RANGE;
    }

    sendPayload(): void {
        return;
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
        expect(abstractPlayer['activeGameService']).to.equal(activeGameServiceTest);
    });

    it('playTurn should call findAction method', () => {
        const findActionSpy = chai.spy.on(abstractPlayer, 'findAction', () => {
            return;
        });
        abstractPlayer.playTurn();
        expect(findActionSpy).to.be.called();
    });

    it('generateWordFindingRequest should call findPointRange method', () => {
        const findPointRangeSpy = spy.on(abstractPlayer, 'findPointRange', () => {
            return;
        });
        abstractPlayer.generateWordFindingRequest();
        expect(findPointRangeSpy).to.have.been.called();
    });

    it('generateWordFindingRequest should return WordFindingRequest with correct data', () => {
        const testWordFindingRequest = abstractPlayer.generateWordFindingRequest();
        expect(testWordFindingRequest.useCase).to.equal(WordFindingUseCase.Beginner);
        expect(testWordFindingRequest.pointHistory).to.deep.equal(abstractPlayer.pointHistory);
        expect(testWordFindingRequest.pointRange).to.deep.equal(TEST_POINT_RANGE);
    });

    // TODO: MODIFY WHEN SEND PAYLOAD IMPLEMENTED
    it('should throw when sendPayload()', () => {
        expect(abstractPlayer.sendPayload()).to.be.undefined;
    });
});
