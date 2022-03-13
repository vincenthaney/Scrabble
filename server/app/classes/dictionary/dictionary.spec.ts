/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { expect } from 'chai';
import Dictionary from './dictionary';

const WORDS = ['abc', 'abcd', 'abcde', 'xyz', 'wxyz', 'ablmnop'];

describe('DictionaryNode', () => {
    let dictionary: Dictionary;

    beforeEach(() => {
        dictionary = new Dictionary(WORDS);
    });

    describe('constructor', () => {
        it('should contain all words', () => {
            for (const word of WORDS) {
                expect(dictionary.wordExists(word)).to.be.true;
            }
        });

        it('should not contain other words', () => {
            for (const word of WORDS) {
                expect(dictionary.wordExists(word + '-')).to.be.false;
            }
        });
    });
});
