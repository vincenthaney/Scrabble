/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { Board } from '@app/classes/board';
import { ScoredWordPlacement, WordFindingUseCase } from '@app/classes/word-finding';
import Game from '@app/classes/game/game';
import { LetterValue } from '@app/classes/tile';
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
    TEST_POINT_RANGE,
    TEST_SCORE,
    TEST_START_POSITION,
} from '@app/constants/virtual-player-tests-constants';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import { Delay } from '@app/utils/delay';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { BeginnerVirtualPlayer } from './beginner-virtual-player';

const testEvaluatedPlacements: ScoredWordPlacement[] = [
    { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE },
];

const TEST_SELECT_COUNT = 3;

describe('BeginnerVirtualPlayer', () => {
    let beginnerVirtualPlayer: BeginnerVirtualPlayer;

    beforeEach(async () => {
        beginnerVirtualPlayer = new BeginnerVirtualPlayer(PLAYER_ID, PLAYER_NAME);
    });

    afterEach(() => {
        chai.spy.restore();
    });

    it('should create', () => {
        expect(beginnerVirtualPlayer).to.exist;
    });

    describe('playTurn', async () => {
        let actionPassSpy: unknown;
        let sendActionSpy: unknown;
        beforeEach(() => {
            spy.on(Delay, 'for', () => {
                return;
            });
            spy.on(beginnerVirtualPlayer, 'findAction', () => {
                return;
            });
            actionPassSpy = spy.on(ActionPass, 'createActionData');
            sendActionSpy = spy.on(beginnerVirtualPlayer['virtualPlayerService'], 'sendAction');
        });

        afterEach(() => {
            chai.spy.restore();
        });

        it('should send actionPass when no words are found', async () => {
            await beginnerVirtualPlayer.playTurn();

            expect(sendActionSpy).to.have.been.called();
            expect(actionPassSpy).to.have.been.called();
        });

        it('should send action returned by findAction when no words are found', async () => {
            spy.on(Promise, 'race', () => {
                return ['testArray'];
            });
            await beginnerVirtualPlayer.playTurn();

            expect(sendActionSpy).to.have.been.called();
            expect(actionPassSpy).to.not.have.been.called();
        });
    });

    describe('findPointRange', () => {
        it('findPointRange should return low range values', () => {
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_LOW;
            });

            const testPointRange = beginnerVirtualPlayer.findPointRange();
            expect(testPointRange.min).to.equal(LOW_SCORE_RANGE_MIN);
            expect(testPointRange.max).to.equal(LOW_SCORE_RANGE_MAX);
        });

        it('findPointRange should return medium range values', () => {
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_MEDIUM;
            });

            const testPointRange = beginnerVirtualPlayer.findPointRange();
            expect(testPointRange.min).to.equal(MEDIUM_SCORE_RANGE_MIN);
            expect(testPointRange.max).to.equal(MEDIUM_SCORE_RANGE_MAX);
        });

        it('findPointRange should return high range values', () => {
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_HIGH;
            });

            const testPointRange = beginnerVirtualPlayer.findPointRange();
            expect(testPointRange.min).to.equal(HIGH_SCORE_RANGE_MIN);
            expect(testPointRange.max).to.equal(HIGH_SCORE_RANGE_MAX);
        });
    });

    describe('Find Action with RANDOM_VALUE_PASS', () => {
        it('findAction should call ActionPass.createActionData() if random is RANDOM_VALUE_PASS', () => {
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_PASS;
            });
            const createActionDataPassSpy = spy.on(ActionPass, 'createActionData', () => {
                return;
            });
            beginnerVirtualPlayer.findAction();
            expect(createActionDataPassSpy).to.have.been.called();
        });
    });

    describe('Find Action with RANDOM_VALUE_PLACE', () => {
        beforeEach(async () => {
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_PLACE;
            });
            spy.on(beginnerVirtualPlayer, 'isExchangeImpossible', () => {
                return false;
            });
        });

        it('findAction should call createWordFindingPlacement if random is RANDOM_VALUE_PLACE', () => {
            const createWordSpy = spy.on(beginnerVirtualPlayer, 'computeWordPlacement', () => {
                return;
            });
            beginnerVirtualPlayer.findAction();
            expect(createWordSpy).to.have.been.called();
        });

        it('findAction should call ActionPass.createActionData if no possible placements are found', () => {
            const testEmptyEvaluatedPlacement = undefined;
            spy.on(beginnerVirtualPlayer, 'computeWordPlacement', () => {
                return testEmptyEvaluatedPlacement;
            });
            const createActionDataPassSpy = spy.on(ActionPass, 'createActionData', () => {
                return;
            });
            beginnerVirtualPlayer.findAction();
            expect(createActionDataPassSpy).to.have.been.called();
        });

        it('findAction should call ActionPlace.createActionData because possible placement', () => {
            spy.on(beginnerVirtualPlayer, 'computeWordPlacement', () => {
                return testEvaluatedPlacements;
            });
            const createActionDataPlaceSpy = spy.on(ActionPlace, 'createActionData', () => {
                return;
            });
            beginnerVirtualPlayer.findAction();
            expect(createActionDataPlaceSpy).to.have.been.called();
        });

        it('findAction should call updateHistory', () => {
            spy.on(beginnerVirtualPlayer, 'computeWordPlacement', () => {
                return testEvaluatedPlacements;
            });
            spy.on(ActionPlace, 'createActionData', () => {
                return;
            });
            const updateHistorySpy = spy.on(beginnerVirtualPlayer, 'updateHistory', () => {
                return;
            });
            beginnerVirtualPlayer.findAction();
            expect(updateHistorySpy).to.have.been.called();
        });
    });

    describe('Find Action with RANDOM_VALUE_EXCHANGE', () => {
        it('findAction should call ActionExchange.createActionData()', () => {
            spy.on(Math, 'random', () => {
                return RANDOM_VALUE_EXCHANGE;
            });
            spy.on(beginnerVirtualPlayer, 'isExchangeImpossible', () => {
                return false;
            });
            const actionExchangeSpy = spy.on(ActionExchange, 'createActionData', () => {
                return;
            });
            beginnerVirtualPlayer.findAction();
            expect(actionExchangeSpy).to.have.been.called();
        });
    });

    describe('updateHistory', () => {
        afterEach(() => {
            chai.spy.restore();
        });

        it('should increment value', () => {
            const testEvaluatedPlacement = { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE };
            beginnerVirtualPlayer.pointHistory.set(TEST_SCORE, TEST_COUNT_VALUE);
            beginnerVirtualPlayer.updateHistory(testEvaluatedPlacement);
            expect(beginnerVirtualPlayer.pointHistory.get(TEST_SCORE)).to.deep.equal(TEST_COUNT_VALUE + EXPECTED_INCREMENT_VALUE);
        });

        it('should set value to 1', () => {
            const testEvaluatedPlacement = { tilesToPlace: [], orientation: TEST_ORIENTATION, startPosition: TEST_START_POSITION, score: TEST_SCORE };
            beginnerVirtualPlayer.updateHistory(testEvaluatedPlacement);
            expect(beginnerVirtualPlayer.pointHistory.get(TEST_SCORE)).to.deep.equal(EXPECTED_INCREMENT_VALUE);
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

    it('generateWordFindingRequest should call findPointRange method', () => {
        const findPointRangeSpy = spy.on(beginnerVirtualPlayer, 'findPointRange', () => {
            return;
        });
        beginnerVirtualPlayer.generateWordFindingRequest();
        expect(findPointRangeSpy).to.have.been.called();
    });

    it('generateWordFindingRequest should return WordFindingRequest with correct data', () => {
        spy.on(beginnerVirtualPlayer, 'findPointRange', () => {
            return TEST_POINT_RANGE;
        });
        const testWordFindingRequest = beginnerVirtualPlayer.generateWordFindingRequest();
        expect(testWordFindingRequest.useCase).to.equal(WordFindingUseCase.Beginner);
        expect(testWordFindingRequest.pointHistory).to.deep.equal(beginnerVirtualPlayer.pointHistory);
        expect(testWordFindingRequest.pointRange).to.deep.equal(TEST_POINT_RANGE);
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
            beginnerVirtualPlayer.computeWordPlacement();
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
            beginnerVirtualPlayer.computeWordPlacement();
            expect(getGameBoardSpy).to.have.been.called();
            expect(generateWordSpy).to.have.been.called();
        });
    });

    describe('selectRandomTiles', () => {
        it('should send the specified tile count', () => {
            beginnerVirtualPlayer.tiles = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
                { letter: 'D', value: 0 },
                { letter: 'F', value: 0 },
            ];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            stub(beginnerVirtualPlayer, 'isExchangeImpossible' as any).returns(false);
            const ceilStub = stub(Math, 'ceil').returns(TEST_SELECT_COUNT);
            expect(beginnerVirtualPlayer['selectRandomTiles']().length).to.equal(TEST_SELECT_COUNT);
            ceilStub.restore();
        });
    });

    describe('isExchangeImpossible', () => {
        let TEST_GAME: Game;
        let TEST_MAP: Map<LetterValue, number>;
        beforeEach(() => {
            TEST_GAME = new Game();

            spy.on(beginnerVirtualPlayer['activeGameService'], 'getGame', () => {
                return TEST_GAME;
            });
            spy.on(TEST_GAME, 'getTilesLeftPerLetter', () => {
                return TEST_MAP;
            });
        });
        it('should return true when tiles count is below MINIMUM_EXCHANGE_WORD_COUNT', () => {
            TEST_MAP = new Map<LetterValue, number>([
                ['A', 2],
                ['B', 2],
            ]);
            expect(beginnerVirtualPlayer['isExchangeImpossible']()).to.be.true;
        });

        it('should return false when tiles count is above or equal to MINIMUM_EXCHANGE_WORD_COUNT', () => {
            TEST_MAP = new Map<LetterValue, number>([
                ['A', 3],
                ['B', 3],
                ['C', 3],
            ]);
            expect(beginnerVirtualPlayer['isExchangeImpossible']()).to.be.false;
        });
    });
});
