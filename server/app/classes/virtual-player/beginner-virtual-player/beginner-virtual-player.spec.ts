/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { Board } from '@app/classes/board';
import { EvaluatedPlacement } from '@app/classes/word-finding/word-placement';
import {
    HIGH_MAXIMUM_VALUE,
    HIGH_MINIMUM_VALUE,
    LOW_MAXIMUM_VALUE,
    LOW_MINIMUM_VALUE,
    MEDIUM_MAXIMUM_VALUE,
    MEDIUM_MINIMUM_VALUE,
} from '@app/constants/virtual-player-constants';
import {
    EXPECTED_INCREMENT_VALUE,
    GAME_ID,
    PLAYER_ID,
    PLAYER_NAME,
    RANDOM_VALUE_EXCHANGE,
    RANDOM_VALUE_HIGH,
    RANDOM_VALUE_LOW,
    RANDOM_VALUE_MEDIUM,
    RANDOM_VALUE_PASS,
    RANDOM_VALUE_PLACE,
    TEST_COUNT_VALUE,
    TEST_ORIENTATION,
    TEST_SCORE,
    TEST_START_POSITION,
} from '@app/constants/virtual-player-tests-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { WordFindingService } from '@app/services/word-finding/word-finding';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
// import Sinon = require('sinon');
import { BeginnerVirtualPlayer } from './beginner-virtual-player';

const testEvaluatedPlacements: EvaluatedPlacement[] = [
    { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE },
];

describe('BeginnerVirtualPlayer', () => {
    let beginnerVirtualPlayer: BeginnerVirtualPlayer;

    beforeEach(async () => {
        beginnerVirtualPlayer = new BeginnerVirtualPlayer(GAME_ID, PLAYER_ID, PLAYER_NAME);
    });

    afterEach(() => {
        chai.spy.restore();
    });

    it('should create', () => {
        expect(beginnerVirtualPlayer).to.exist;
    });

    it('findPointRange should return low range values', () => {
        spy.on(Math, 'random', () => {
            return RANDOM_VALUE_LOW;
        });

        const testPointRange = beginnerVirtualPlayer.findPointRange();
        expect(testPointRange.minimum).to.equal(LOW_MINIMUM_VALUE);
        expect(testPointRange.maximum).to.equal(LOW_MAXIMUM_VALUE);
    });

    it('findPointRange should return medium range values', () => {
        spy.on(Math, 'random', () => {
            return RANDOM_VALUE_MEDIUM;
        });

        const testPointRange = beginnerVirtualPlayer.findPointRange();
        expect(testPointRange.minimum).to.equal(MEDIUM_MINIMUM_VALUE);
        expect(testPointRange.maximum).to.equal(MEDIUM_MAXIMUM_VALUE);
    });

    it('findPointRange should return high range values', () => {
        spy.on(Math, 'random', () => {
            return RANDOM_VALUE_HIGH;
        });

        const testPointRange = beginnerVirtualPlayer.findPointRange();
        expect(testPointRange.minimum).to.equal(HIGH_MINIMUM_VALUE);
        expect(testPointRange.maximum).to.equal(HIGH_MAXIMUM_VALUE);
    });

    it('findAction should call ActionPass.getData()', () => {
        spy.on(Math, 'random', () => {
            return RANDOM_VALUE_PASS;
        });
        const getDataPassSpy = spy.on(ActionPass, 'getData', () => {
            return;
        });
        beginnerVirtualPlayer.findAction();
        expect(getDataPassSpy).to.have.been.called();
    });

    it('findAction should call createWordFindingPlacement', () => {
        spy.on(Math, 'random', () => {
            return RANDOM_VALUE_PLACE;
        });
        const createWordSpy = spy.on(beginnerVirtualPlayer, 'createWordFindingPlacement', () => {
            return;
        });
        beginnerVirtualPlayer.findAction();
        expect(createWordSpy).to.have.been.called();
    });

    it('findAction should call ActionPass.getData because not possible placements', () => {
        spy.on(Math, 'random', () => {
            return RANDOM_VALUE_PLACE;
        });
        const testEmptyEvaluatedPlacement = undefined;
        spy.on(beginnerVirtualPlayer, 'createWordFindingPlacement', () => {
            return testEmptyEvaluatedPlacement;
        });
        const getDataPassSpy = spy.on(ActionPass, 'getData', () => {
            return;
        });
        beginnerVirtualPlayer.findAction();
        expect(getDataPassSpy).to.have.been.called();
    });

    it('findAction should call ActionPlace.getData because possible placement', () => {
        spy.on(Math, 'random', () => {
            return RANDOM_VALUE_PLACE;
        });

        spy.on(beginnerVirtualPlayer, 'createWordFindingPlacement', () => {
            return testEvaluatedPlacements;
        });
        const getDataPassSpy = spy.on(ActionPlace, 'getData', () => {
            return;
        });
        beginnerVirtualPlayer.findAction();
        expect(getDataPassSpy).to.have.been.called();
    });

    it('findAction should call updateHistoric', () => {
        spy.on(Math, 'random', () => {
            return RANDOM_VALUE_PLACE;
        });
        spy.on(beginnerVirtualPlayer, 'createWordFindingPlacement', () => {
            return testEvaluatedPlacements;
        });
        spy.on(ActionPlace, 'getData', () => {
            return;
        });
        const updateHistoricSpy = spy.on(beginnerVirtualPlayer, 'updateHistoric', () => {
            return;
        });
        beginnerVirtualPlayer.findAction();
        expect(updateHistoricSpy).to.have.been.called();
    });

    it('findAction should call ActionExchange.getData()', () => {
        spy.on(Math, 'random', () => {
            return RANDOM_VALUE_EXCHANGE;
        });
        const actionExchangeSpy = spy.on(ActionExchange, 'getData', () => {
            return;
        });
        beginnerVirtualPlayer.findAction();
        expect(actionExchangeSpy).to.have.been.called();
    });

    describe('updateHistoric', () => {
        afterEach(() => {
            chai.spy.restore();
        });

        it('should increment value', () => {
            const testEvaluatedPlacement = { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE };
            beginnerVirtualPlayer.pointHistoric.set(TEST_SCORE, TEST_COUNT_VALUE);
            beginnerVirtualPlayer.updateHistoric(testEvaluatedPlacement);
            expect(beginnerVirtualPlayer.pointHistoric.get(TEST_SCORE)).to.deep.equal(TEST_COUNT_VALUE + EXPECTED_INCREMENT_VALUE);
        });

        it('should set value to 1', () => {
            const testEvaluatedPlacement = { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE };
            beginnerVirtualPlayer.updateHistoric(testEvaluatedPlacement);
            expect(beginnerVirtualPlayer.pointHistoric.get(TEST_SCORE)).to.deep.equal(EXPECTED_INCREMENT_VALUE);
        });
    });

    describe('getGameBoard', () => {
        it('should call getGame', () => {
            const activeGameServiceStub = createStubInstance(ActiveGameService);
            beginnerVirtualPlayer['activeGameService'] = activeGameServiceStub as unknown as ActiveGameService;

            const testBoard = {} as unknown as Board;
            const getGameSpy = spy.on(beginnerVirtualPlayer['activeGameService'], 'getGame', () => {
                return testBoard;
            });
            beginnerVirtualPlayer.getGameBoard(GAME_ID, PLAYER_ID);
            expect(getGameSpy).to.have.been.called();
        });
    });
    describe('createWordFindingPlacement', () => {
        let wordFindingServiceStub: SinonStubbedInstance<WordFindingService>;

        beforeEach(async () => {
            wordFindingServiceStub = createStubInstance(WordFindingService);
            beginnerVirtualPlayer['wordFindingService'] = wordFindingServiceStub as unknown as WordFindingService;
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should call findWords', () => {
            const findWordsSpy = spy.on(beginnerVirtualPlayer['wordFindingService'], 'findWords', () => {
                return [];
            });
            spy.on(beginnerVirtualPlayer, 'getGameBoard', () => {
                return;
            });
            spy.on(beginnerVirtualPlayer, 'generateWordFindingRequest', () => {
                return;
            });
            beginnerVirtualPlayer.createWordFindingPlacement();
            expect(findWordsSpy).to.have.been.called();
        });

        it('should call getGameBoard and generateWord', () => {
            chai.spy.on(beginnerVirtualPlayer['wordFindingService'], 'findWords', () => {
                return [];
            });
            const getGameBoardSpy = spy.on(beginnerVirtualPlayer, 'getGameBoard', () => {
                return;
            });
            const generateWordSpy = spy.on(beginnerVirtualPlayer, 'generateWordFindingRequest', () => {
                return;
            });
            beginnerVirtualPlayer.createWordFindingPlacement();
            expect(getGameBoardSpy).to.have.been.called();
            expect(generateWordSpy).to.have.been.called();
        });
    });
});
