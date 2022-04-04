/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';
import { Container } from 'typedi';
import { getDictionaryTestService } from '@app/services/dictionary-service/dictionary-test.service.spec';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import WordFindingService, { WordFindingParameters } from './word-finding.service';
import { Board } from '@app/classes/board';
import { AbstractWordFinding, WordFindingBeginner, WordFindingHint, WordFindingRequest, WordFindingUseCase } from '@app/classes/word-finding';
import { expect } from 'chai';
import { Tile } from '@app/classes/tile';
import Range from '@app/classes/range/range';
import { Dictionary } from '@app/classes/dictionary';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import * as sinon from 'sinon';

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

    describe('findWords', () => {
        it('should call getWordFindingInstance', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const getWordFindingInstanceStub = stub(service, 'getWordFindingInstance' as any).callsFake(() => {
                return new WordFindingHint(
                    boardStub as unknown as Board,
                    tiles,
                    request,
                    {} as unknown as Dictionary,
                    {} as unknown as ScoreCalculatorService,
                );
            });
            stub(service['dictionaryService'], 'getDictionary').callsFake(() => {
                return {} as unknown as Dictionary;
            });
            service.findWords(boardStub as unknown as Board, tiles, 'id', request);

            expect(getWordFindingInstanceStub.called).to.be.true;
        });

        it('should call findWords', () => {
            service.findWords(boardStub as unknown as Board, tiles, 'id', request);

            expect(findWordsStub.called).to.be.true;
        });
    });

    describe('getWordFindingInstance', () => {
        let params: WordFindingParameters;

        beforeEach(() => {
            params = [
                boardStub as unknown as Board,
                tiles,
                request,
                new Dictionary({ title: '', description: '', words: [], id: 'id', isDefault: false }),
                undefined as unknown as ScoreCalculatorService,
            ];
        });

        it('should return WordFindingHint if useCase is hint', () => {
            const result = service['getWordFindingInstance'](WordFindingUseCase.Hint, params);
            expect(result).to.be.instanceOf(WordFindingHint);
        });

        it('should return WordFindingBeginner if useCase is beginner', () => {
            const result = service['getWordFindingInstance'](WordFindingUseCase.Beginner, params);
            expect(result).to.be.instanceOf(WordFindingBeginner);
        });

        it('should throw if useCase is expert', () => {
            expect(() => service['getWordFindingInstance'](WordFindingUseCase.Expert, params)).to.throw();
        });
    });
});
