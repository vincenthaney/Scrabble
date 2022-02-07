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

    it('should contain dictionary', () => {
        expect(wordsVerificationService.activeDictionaries.has(DICTIONARY_NAME)).to.be.true;
    });

    it('should not have any character with accent', () => {
        expect(wordsVerificationService.removeAccents('ŠšŽžÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìiíiîiïiñòóôõöùúûýÿ')).to.equal(
            'SsZzAAAAAACEEEEIIIINOOOOOUUUUYaaaaaaceeeeiiiiiiiinooooouuuyy',
        );
    });

    it('should return error because word too short', () => {
        const testWord = 'a';
        const result = () => wordsVerificationService.verifyWords([testWord], DICTIONARY_NAME);
        expect(result).to.Throw(testWord + WORD_TOO_SHORT);
    });

    it('should return error because word contains asterisk', () => {
        const testWord = 'ka*ak';
        const result = () => wordsVerificationService.verifyWords([testWord], DICTIONARY_NAME);
        expect(result).to.Throw(testWord + WORD_CONTAINS_HYPHEN);
    });

    it('should return error because word contains hyphen', () => {
        const testWord = 'a-a';
        const result = () => wordsVerificationService.verifyWords([testWord], DICTIONARY_NAME);
        expect(result).to.Throw(testWord + WORD_CONTAINS_HYPHEN);
    });

    it('should return error because word contains apostrophe', () => {
        const testWord = "aaaa'aaaa";
        const result = () => wordsVerificationService.verifyWords([testWord], DICTIONARY_NAME);
        expect(result).to.Throw(testWord + WORD_CONTAINS_APOSTROPHE);
    });

    it('should return error if word is not in dictionary', () => {
        const testWord = 'ufdwihfewa';
        const result = () => wordsVerificationService.verifyWords([testWord], DICTIONARY_NAME);
        expect(result).to.Throw(testWord + INVALID_WORD);
    });

    it('should be true when word is in the dictionary', () => {
        const wordsCount = 1;
        const words: string[] = [];
        const dictionary = wordsVerificationService.activeDictionaries.get(DICTIONARY_NAME);

        if (dictionary) {
            const dictionaryIterator = dictionary[Symbol.iterator]();
            let i = 0;
            while (i < wordsCount) {
                words.push(dictionaryIterator.next().value);
                i++;
            }
        }
        expect(wordsVerificationService.verifyWords(words, DICTIONARY_NAME)).to.deep.equal(words);
    });

    it('should be true when words are in the dictionary', () => {
        const wordsCount = 4;
        const words: string[] = [];
        const dictionary = wordsVerificationService.activeDictionaries.get(DICTIONARY_NAME);

        if (dictionary) {
            const dictionaryIterator = dictionary[Symbol.iterator]();
            let i = 0;
            while (i < wordsCount) {
                words.push(dictionaryIterator.next().value);
                i++;
            }
        }
        expect(wordsVerificationService.verifyWords(words, DICTIONARY_NAME)).to.deep.equal(words);
    });
});
