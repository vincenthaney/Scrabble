/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container } from 'typedi';
import { getDictionaryTestService } from '@app/services/dictionary-service/dictionary-test.service.spec';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import WordFindingService from './word-finding.service';
import { Board } from '@app/classes/board';
import { AbstractWordFinding, WordFindingBeginner, WordFindingHint, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';
import { expect } from 'chai';
import { Tile } from '@app/classes/tile';
import Range from '@app/classes/range/range';
import WordFindingExpert from '@app/classes/word-finding/word-finding-expert/word-finding-expert';
import { PartialWordFindingParameters } from '@app/classes/word-finding/word-finding-types';
import * as sinon from 'sinon';

const TEST_ID = 'TEST_ID';
describe('WordFindingService', () => {
    let findWordsStub: SinonStub;
    let service: WordFindingService;
    let boardStub: SinonStubbedInstance<Board>;
    let tiles: Tile[];
    let request: WordFindingRequest;

    beforeEach(() => {
        sinon.restore();
        Container.set(DictionaryService, getDictionaryTestService());
        service = Container.get(WordFindingService);
        findWordsStub = stub(AbstractWordFinding.prototype, 'findWords').callsFake(() => []);

        boardStub = createStubInstance(Board);
        tiles = [];
        request = {
            useCase: WordFindingUseCase.Beginner,
            pointRange: new Range(0, 1),
            pointHistory: new Map(),
        };
    });

    afterEach(() => {
        sinon.restore();
        Container.reset();
        findWordsStub.restore();
    });

    describe('getWordFindingInstance', () => {
        let params: PartialWordFindingParameters;

        beforeEach(() => {
            params = [boardStub as unknown as Board, tiles, request];
        });

        it('should return WordFindingHint if useCase is hint', () => {
            const result = service['getWordFindingInstance'](WordFindingUseCase.Hint, TEST_ID, params);
            expect(result).to.be.instanceOf(WordFindingHint);
        });

        it('should return WordFindingBeginner if useCase is beginner', () => {
            const result = service['getWordFindingInstance'](WordFindingUseCase.Beginner, TEST_ID, params);
            expect(result).to.be.instanceOf(WordFindingBeginner);
        });

        it('should return WordFindingExpert if useCase is expert', () => {
            const result = service['getWordFindingInstance'](WordFindingUseCase.Expert, TEST_ID, params);
            expect(result).to.be.instanceOf(WordFindingExpert);
        });
    });
});
