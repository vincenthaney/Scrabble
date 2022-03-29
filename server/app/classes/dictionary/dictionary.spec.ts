/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { expect } from 'chai';
import Dictionary from './dictionary';
import { DictionaryDataComplete } from './dictionary-data';

const TEST_WORDS = ['ab', 'abc', 'abcd', 'abcde'];
const DICTIONARY_DATA: DictionaryDataComplete = {
    title: 'Test dictionary',
    description: 'Dictionary for testing',
    words: TEST_WORDS,
    id: 'id',
};

describe('DictionaryNode', () => {
    let dictionary: Dictionary;

    beforeEach(() => {
        dictionary = new Dictionary(DICTIONARY_DATA);
    });

    describe('constructor', () => {
        it('should contain all words', () => {
            for (const word of TEST_WORDS) {
                expect(dictionary.wordExists(word)).to.be.true;
            }
        });

        it('should not contain other words', () => {
            for (const word of TEST_WORDS) {
                expect(dictionary.wordExists(word + '-')).to.be.false;
            }
        });
    });
});
