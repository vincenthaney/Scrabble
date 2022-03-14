/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Dictionary } from '@app/classes/dictionary';
import { expect } from 'chai';
import { Container } from 'typedi';
import DictionaryService from './dictionary.service';
import { DICTIONARIES } from '@app/constants/dictionary.const';
import { join } from 'path';
import { SinonStub, stub } from 'sinon';
import * as mock from 'mock-fs';

const TEST_DICTIONARY_NAME = 'test dictionary';
const TEST_DICTIONARY = {
    name: TEST_DICTIONARY_NAME,
    description: '',
    words: ['abc', 'abcd', 'abcde'],
};

describe('DictionaryService', () => {
    let service: DictionaryService;

    beforeEach(() => {
        service = Container.get(DictionaryService);
    });

    describe('getDictionary', () => {
        let dictionary: Dictionary;

        beforeEach(() => {
            dictionary = new Dictionary([]);
            service['dictionaries'].set(TEST_DICTIONARY_NAME, dictionary);
        });

        it('should return dictionary if it exists', () => {
            const result = service.getDictionary(TEST_DICTIONARY_NAME);
            expect(result).to.equal(dictionary);
        });

        it("should return undefined if it doesn't exists", () => {
            const result = service.getDictionary('invalid dictionary');
            expect(result).to.be.undefined;
        });
    });

    describe('addAllDictionaries', () => {
        let dictionary: Dictionary;
        let fetchDictionaryWordsStub: SinonStub;

        beforeEach(() => {
            dictionary = new Dictionary([]);
            fetchDictionaryWordsStub = stub<DictionaryService, any>(service, 'fetchDictionaryWords').returns(dictionary);
        });

        it('should add dictionaries to map', () => {
            service['addAllDictionaries']();

            for (const [, dictionaryName] of DICTIONARIES) {
                expect(service['dictionaries'].has(dictionaryName)).to.be.true;
                expect(fetchDictionaryWordsStub.called).to.be.true;
                fetchDictionaryWordsStub.reset();
            }
        });
    });

    describe('fetchDictionaryWords', () => {
        // mockPaths must be of type any because keys must be dynamic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let mockPaths: any;
        let path: string;

        beforeEach(() => {
            path = DICTIONARIES[0][0];
            mockPaths[join(__dirname, path)] = TEST_DICTIONARY;
        });

        afterEach(() => {
            mock.restore();
        });

        it('should return dictionary', () => {
            const result = service['fetchDictionaryWords'](path);

            expect(result).to.exist;
        });

        it('should return dictionary with words', () => {
            const result = service['fetchDictionaryWords'](path);

            for (const word of TEST_DICTIONARY.words) {
                expect(result.wordExists(word)).to.be.true;
            }
        });
    });
});
