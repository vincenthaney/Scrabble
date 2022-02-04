// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import { INVALID_WORD, WORD_CONTAINS_APOSTROPHE, WORD_CONTAINS_HYPHEN, WORD_TOO_SHORT } from '@app/constants/errors';
import { expect } from 'chai';
import { WordsVerificationService } from './words-verification.service';
import { DICTIONARY_NAME } from './words-verification.service.const';

describe('WordsVerificationService', () => {
    let wordsVerificationService: WordsVerificationService;

    beforeEach(() => {
        wordsVerificationService = new WordsVerificationService();
    });

    it('should create', () => {
        expect(wordsVerificationService).to.exist;
    });

    beforeEach(() => {
        wordsVerificationService = new WordsVerificationService();
    });

    it('should contain dictionary', () => {
        expect(wordsVerificationService.activeDictionaries.has('dictionary')).to.be.true;
    });

    it('should not have any character with accent', () => {
        expect(wordsVerificationService.removeAccents('àbçdé')).to.equal('abcde');
    });

    it('should return error because word too short', () => {
        const result = () => wordsVerificationService.verifyWords(['a'], DICTIONARY_NAME);
        expect(result).to.Throw(WORD_TOO_SHORT);
    });

    it('should return error because word contains hyphen', () => {
        const result = () => wordsVerificationService.verifyWords(['a-a'], DICTIONARY_NAME);
        expect(result).to.Throw(WORD_CONTAINS_HYPHEN);
    });

    it('should return error because word contains apostrophe', () => {
        const result = () => wordsVerificationService.verifyWords(["aaaa'aaaa"], DICTIONARY_NAME);
        expect(result).to.Throw(WORD_CONTAINS_APOSTROPHE);
    });

    it('should return error if word is not in dictionary', () => {
        const result = () => wordsVerificationService.verifyWords(['ufdwihfewa'], DICTIONARY_NAME);
        expect(result).to.Throw(INVALID_WORD);
    });

    it('should be true when words are in the dictionary', () => {
        const words = ['acagnarderait', 'hydrolysates'];
        const result = () => wordsVerificationService.verifyWords(words, DICTIONARY_NAME);
        expect(result).to.equal(words);
    });
});
