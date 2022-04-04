/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ScoredWordPlacement, WordFindingUseCase } from '@app/classes/word-finding';
import {
    HIGH_SCORE_RANGE_MAX,
    HIGH_SCORE_RANGE_MIN,
    LOW_SCORE_RANGE_MAX,
    LOW_SCORE_RANGE_MIN,
    MEDIUM_SCORE_RANGE_MAX,
    MEDIUM_SCORE_RANGE_MIN,
} from '@app/constants/virtual-player-constants';
import {
    EXPECTED_INCREMENT_VALUE,
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
    TEST_POINT_RANGE,
    TEST_SCORE,
    TEST_START_POSITION,
} from '@app/constants/virtual-player-tests-constants';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { ExpertVirtualPlayer } from './expert-virtual-player';
import { ActionData } from '@app/classes/communication/action-data';

const testEvaluatedPlacements: ScoredWordPlacement[] = [
    { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE },
];

const TEST_SELECT_COUNT = 3;

describe('ExpertVirtualPlayer', () => {
    let expertVirtualPlayer: ExpertVirtualPlayer;

    beforeEach(async () => {
        expertVirtualPlayer = new ExpertVirtualPlayer(PLAYER_ID, PLAYER_NAME);
    });

    afterEach(() => {
        chai.spy.restore();
    });

    it('should create', () => {
        expect(expertVirtualPlayer).to.exist;
    });

    describe('findPointRange', () => {
        it('findPointRange should return the whole positive range', () => {
            const testPointRange = expertVirtualPlayer['findPointRange']();
            expect(testPointRange.min).to.equal(0);
            expect(testPointRange.max).to.equal(Number.MAX_SAFE_INTEGER);
        });
    });

    describe('Find Action with RANDOM_VALUE_PASS', () => {
        it('findAction should call ActionPass.createActionData() if random is RANDOM_VALUE_PASS', () => {
            spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return {} as unknown as ScoredWordPlacement;
            });
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_PASS;
            });
            const createActionDataPassSpy = spy.on(ActionPass, 'createActionData', () => {
                return;
            });
            expertVirtualPlayer['findAction']();
            expect(createActionDataPassSpy).to.have.been.called();
        });
    });

    describe('findAction', () => {
        it('should call computeWordPlacement', () => {
            const createWordSpy = spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return;
            });

            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return true;
            });
            expertVirtualPlayer['findAction']();
            expect(createWordSpy).to.have.been.called();
        });

        it('findAction should call ActionPass.createActionData if no possible placements are found', () => {
            const testEmptyEvaluatedPlacement = undefined;
            spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return testEmptyEvaluatedPlacement;
            });
            const createActionDataPassSpy = stub(ActionPass, 'createActionData').returns({} as unknown as ActionData);
            const exchangeActionDataPassSpy = stub(ActionExchange, 'createActionData').returns({} as unknown as ActionData);
            expertVirtualPlayer['findAction']();
            expect(createActionDataPassSpy.called || exchangeActionDataPassSpy.called).to.true;
        });

        it('findAction should call ActionPlace.createActionData because possible placement', () => {
            spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return testEvaluatedPlacements;
            });
            const createActionDataPlaceSpy = spy.on(ActionPlace, 'createActionData', () => {
                return;
            });
            expertVirtualPlayer['findAction']();
            expect(createActionDataPlaceSpy).to.have.been.called();
        });

        it('findAction should call updateHistory', () => {
            spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return testEvaluatedPlacements;
            });
            spy.on(ActionPlace, 'createActionData', () => {
                return;
            });
            const updateHistorySpy = spy.on(expertVirtualPlayer, 'updateHistory', () => {
                return;
            });
            expertVirtualPlayer['findAction']();
            expect(updateHistorySpy).to.have.been.called();
        });
    });

    describe('Find Action with RANDOM_VALUE_EXCHANGE', () => {
        it('findAction should call ActionExchange.createActionData()', () => {
            spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return {} as unknown as ScoredWordPlacement;
            });
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_EXCHANGE;
            });
            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return true;
            });
            const actionExchangeSpy = spy.on(ActionExchange, 'createActionData', () => {
                return;
            });
            expertVirtualPlayer['findAction']();
            expect(actionExchangeSpy).to.have.been.called();
        });
    });

    describe('updateHistory', () => {
        afterEach(() => {
            chai.spy.restore();
        });

        it('should increment value', () => {
            const testEvaluatedPlacement = { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE };
            expertVirtualPlayer.pointHistory.set(TEST_SCORE, TEST_COUNT_VALUE);
            expertVirtualPlayer['updateHistory'](testEvaluatedPlacement);
            expect(expertVirtualPlayer.pointHistory.get(TEST_SCORE)).to.deep.equal(TEST_COUNT_VALUE + EXPECTED_INCREMENT_VALUE);
        });

        it('should set value to 1', () => {
            const testEvaluatedPlacement = { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE };
            expertVirtualPlayer['updateHistory'](testEvaluatedPlacement);
            expect(expertVirtualPlayer.pointHistory.get(TEST_SCORE)).to.deep.equal(EXPECTED_INCREMENT_VALUE);
        });
    });

    it('generateWordFindingRequest should call findPointRange method', () => {
        const findPointRangeSpy = spy.on(expertVirtualPlayer, 'findPointRange', () => {
            return;
        });
        expertVirtualPlayer['generateWordFindingRequest']();
        expect(findPointRangeSpy).to.have.been.called();
    });

    it('generateWordFindingRequest should return WordFindingRequest with correct data', () => {
        spy.on(expertVirtualPlayer, 'findPointRange', () => {
            return TEST_POINT_RANGE;
        });
        const testWordFindingRequest = expertVirtualPlayer['generateWordFindingRequest']();
        expect(testWordFindingRequest.useCase).to.equal(WordFindingUseCase.Beginner);
        expect(testWordFindingRequest.pointHistory).to.deep.equal(expertVirtualPlayer.pointHistory);
        expect(testWordFindingRequest.pointRange).to.deep.equal(TEST_POINT_RANGE);
    });

    describe('computeWordPlacement', () => {
        let wordFindingServiceStub: SinonStubbedInstance<WordFindingService>;

        beforeEach(async () => {
            wordFindingServiceStub = createStubInstance(WordFindingService);
            expertVirtualPlayer['wordFindingService'] = wordFindingServiceStub as unknown as WordFindingService;
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should call findWords', () => {
            const findWordsSpy = spy.on(expertVirtualPlayer['wordFindingService'], 'findWords', () => {
                return [];
            });
            spy.on(expertVirtualPlayer, 'getGameBoard', () => {
                return;
            });
            spy.on(expertVirtualPlayer, 'generateWordFindingRequest', () => {
                return;
            });
            expertVirtualPlayer['computeWordPlacement']();
            expect(findWordsSpy).to.have.been.called();
        });

        it('should call getGameBoard and generateWord', () => {
            chai.spy.on(expertVirtualPlayer['wordFindingService'], 'findWords', () => {
                return [];
            });
            const getGameBoardSpy = spy.on(expertVirtualPlayer, 'getGameBoard', () => {
                return;
            });
            const generateWordSpy = spy.on(expertVirtualPlayer, 'generateWordFindingRequest', () => {
                return;
            });
            expertVirtualPlayer['computeWordPlacement']();
            expect(getGameBoardSpy).to.have.been.called();
            expect(generateWordSpy).to.have.been.called();
        });
    });

    describe('selectRandomTiles', () => {
        it('should send the specified tile count', () => {
            expertVirtualPlayer.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
                { letter: 'D', value: 0 },
                { letter: 'F', value: 0 },
            ];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            stub(expertVirtualPlayer, 'isExchangePossible' as any).returns(true);
            const ceilStub = stub(Math, 'ceil').returns(TEST_SELECT_COUNT);
            expect(expertVirtualPlayer['selectRandomTiles']().length).to.equal(TEST_SELECT_COUNT);
            ceilStub.restore();
        });
    });
});
