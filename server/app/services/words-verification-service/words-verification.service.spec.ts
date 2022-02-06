// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import { INVALID_WORD, WORD_CONTAINS_APOSTROPHE, WORD_CONTAINS_HYPHEN, WORD_TOO_SHORT } from '@app/constants/errors';
import { expect } from 'chai';
import { WordsVerificationService } from './words-verification.service';
import { WordError } from './words-verification.service.classes';
import { DICTIONARY_NAME } from './words-verification.service.const';

describe('WordsVerificationService', () => {
    let wordsVerificationService: WordsVerificationService;

    beforeEach(() => {
        wordsVerificationService = new WordsVerificationService();
    });

    it('should create', () => {
        expect(wordsVerificationService).to.exist;
    });

    it('should contain dictionary', () => {
        expect(wordsVerificationService.activeDictionaries.has(DICTIONARY_NAME)).to.be.true;
    });

    it('should not have any character with accent', () => {
        expect(wordsVerificationService.removeAccents('àbçdé')).to.equal('abcde');
    });

    it('should return error because word too short', () => {
        const expectedError = new WordError(WORD_TOO_SHORT, 'a');
        const result = () => wordsVerificationService.verifyWords(['a'], DICTIONARY_NAME);
        expect(result).to.Throw(expectedError);
    });

    it('should return error because word contains hyphen', () => {
        const result = () => wordsVerificationService.verifyWords(['a-a'], DICTIONARY_NAME);
        expect(result).to.Throw(new WordError(WORD_CONTAINS_HYPHEN, 'a-a'));
    });

    it('should return error because word contains apostrophe', () => {
        const result = () => wordsVerificationService.verifyWords(["aaaa'aaaa"], DICTIONARY_NAME);
        expect(result).to.Throw(new WordError(WORD_CONTAINS_APOSTROPHE, "aaaa'aaaa"));
    });

    it('should return error if word is not in dictionary', () => {
        const result = () => wordsVerificationService.verifyWords(['ufdwihfewa'], DICTIONARY_NAME);
        expect(result).to.Throw(new WordError(INVALID_WORD, 'ufdwihfewa'));
    });

    it('should be true when word is in the dictionary', () => {
        const words: string[] = [];
        const dictionary = wordsVerificationService.activeDictionaries.get(DICTIONARY_NAME);
        if (dictionary) {
            dictionary.forEach((word) => {
                // eslint-disable-next-line no-console
                console.log(words.length);
                if (words.length < 1) {
                    words.join(word);
                }
            });
            // eslint-disable-next-line no-console
            console.log(words);
        }
        expect(wordsVerificationService.verifyWords(words, DICTIONARY_NAME)).to.deep.equal(words);
    });

    it('should be true when words are in the dictionary', () => {
        const words: string[] = [];
        const dictionary = wordsVerificationService.activeDictionaries.get(DICTIONARY_NAME);
        if (dictionary) {
            dictionary.forEach((word) => {
                // eslint-disable-next-line no-console
                console.log(words.length);
                if (words.length < 3) {
                    words.join(word);
                }
            });
            // eslint-disable-next-line no-console
            console.log(words);
        }
        expect(wordsVerificationService.verifyWords(words, DICTIONARY_NAME)).to.deep.equal(words);
    });
});
