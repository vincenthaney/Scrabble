/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { expect } from 'chai';
import { Container } from 'typedi';
import DictionaryService from './dictionary.service';
import { DICTIONARY_PATHS, INVALID_DICTIONARY_NAME } from '@app/constants/dictionary.const';
import { join } from 'path';
import { SinonStub, stub } from 'sinon';
import * as mock from 'mock-fs';

const TEST_DICTIONARY_NAME = 'TEST_DICTIONARY';
const TEST_DICTIONARY: DictionaryData = {
    title: TEST_DICTIONARY_NAME,
    description: '',
    words: ['abc', 'abcd', 'abcde'],
};
const TEST_PATHS = ['../data/dictionary-french.json', '../data/dictionary-english.json', '../data/dictionary-spanish.json'];

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPaths: any = [];
for (const path of DICTIONARY_PATHS) {
    mockPaths[join(__dirname, path)] = JSON.stringify(TEST_DICTIONARY);
}

describe('DictionaryService', () => {
    let service: DictionaryService;
    let title: string;

    beforeEach(() => {
        mock(mockPaths);
        Container.reset();
        service = Container.get(DictionaryService);
        title = service.getDictionaryTitles()[0];
    });

    afterEach(() => {
        mock.restore();
    });

    describe('getDictionary', () => {
        it('should return dictionary if it exists', () => {
            const result = service.getDictionary(title);
            expect(result).to.exist;
        });

        it("should throw if it doesn't exists", () => {
            expect(() => service.getDictionary('invalid dictionary')).to.throw(INVALID_DICTIONARY_NAME);
        });
    });

    describe('getDefaultDictionary', () => {
        it('should call getDictionary with first getDictionaryTitles value', () => {
            const testTitle = 'test title';
            stub(service, 'getDictionaryTitles').returns([testTitle]);
            const getDictionaryStub = stub(service, 'getDictionary');

            service.getDefaultDictionary();

            expect(getDictionaryStub.calledWith(testTitle));
        });
    });

    describe('addAllDictionaries', () => {
        let fetchDictionaryWordsStub: SinonStub;

        beforeEach(() => {
            service['dictionaryPaths'] = TEST_PATHS;
            fetchDictionaryWordsStub = stub<DictionaryService, any>(service, 'fetchDictionaryWords').callsFake((path: string) => {
                const index = TEST_PATHS.indexOf(path);
                return new Dictionary({ ...TEST_DICTIONARY, title: `dictionary_${index}` });
            });
        });

        it('should call fetchDictionaryWordsStub n times', () => {
            service['addAllDictionaries']();

            expect(fetchDictionaryWordsStub.callCount).to.equal(TEST_PATHS.length);
        });

        it('should have n dictionaries in set after', () => {
            service['dictionaries'] = new Map();
            service['addAllDictionaries']();

            expect(service['dictionaries'].size).to.equal(TEST_PATHS.length);
        });
    });

    describe('fetchDictionaryWords', () => {
        it('should return dictionary', () => {
            const result = service['fetchDictionaryWords'](DICTIONARY_PATHS[0]);

            expect(result).to.exist;
        });

        it('should return dictionary with words', () => {
            const result = service['fetchDictionaryWords'](DICTIONARY_PATHS[0]);

            for (const word of TEST_DICTIONARY.words) {
                expect(result.wordExists(word)).to.be.true;
            }
        });
    });
});
