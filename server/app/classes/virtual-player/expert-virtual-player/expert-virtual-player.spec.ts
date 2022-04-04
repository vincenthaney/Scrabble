/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ScoredWordPlacement, WordFindingUseCase } from '@app/classes/word-finding';
import {
    PLAYER_ID,
    PLAYER_NAME,
    TEST_POINT_RANGE,
} from '@app/constants/virtual-player-tests-constants';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ExpertVirtualPlayer } from './expert-virtual-player';

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


    describe('findAction', () => {
        it('should call computeWordPlacement and ActionPlace.createActionData if there is a placement found', () => {
            const computeWordPlacementSpy = spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return {} as unknown as ScoredWordPlacement;
            });

            const createActionDataSpy = spy.on(ActionPlace, 'createActionData', () => {})
            expertVirtualPlayer['findAction']();
            expect(computeWordPlacementSpy).to.have.been.called();
            expect(createActionDataSpy).to.have.been.called();
        });



        it('should ActionExchange if no moves are found and exchange is possible', () => {
            const computeWordPlacementSpy = spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return undefined;
            });

            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return true;
            });
            const createActionDataSpy = spy.on(ActionExchange, 'createActionData', () => {})

            expertVirtualPlayer['findAction']();
            expect(computeWordPlacementSpy).to.have.been.called();
            expect(createActionDataSpy).to.have.been.called();
        });

        it('should ActionPass if no moves are found and exchange is not possible', () => {
            const computeWordPlacementSpy = spy.on(expertVirtualPlayer, 'computeWordPlacement', () => {
                return undefined;
            });

            spy.on(expertVirtualPlayer, 'isExchangePossible', () => {
                return false;
            });
            const createActionDataSpy = spy.on(ActionPass, 'createActionData', () => {})

            expertVirtualPlayer['findAction']();
            expect(computeWordPlacementSpy).to.have.been.called();
            expect(createActionDataSpy).to.have.been.called();
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
        expect(testWordFindingRequest.useCase).to.equal(WordFindingUseCase.Expert);
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
});
