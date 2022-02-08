// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import { INVALID_WORD, WORD_CONTAINS_APOSTROPHE, WORD_CONTAINS_ASTERISK, WORD_CONTAINS_HYPHEN, WORD_TOO_SHORT } from '@app/constants/errors';
import { expect } from 'chai';
import { WordsVerificationService } from './words-verification.service';
import { DICTIONARY_NAME, DICTIONARY_RELATIVE_PATH } from './words-verification.service.const';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { join } from 'path';
import { DictionaryData } from './words-verification.service.types';
import * as mock from 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname

chai.use(spies);
chai.use(chaiAsPromised);

const mockDictionary: DictionaryData = {
    title: 'My dummy dictionary',
    description: 'Dictionary takes one "n"',
    words: ['this', 'dummy', 'dictionary', 'gave', 'me', 'pain', 'and', 'misery'],
};

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPaths: any = [];
mockPaths[join(__dirname, DICTIONARY_RELATIVE_PATH, DICTIONARY_NAME)] = JSON.stringify(mockDictionary);

describe('WordsVerificationService', () => {
    let wordsVerificationService: WordsVerificationService;
    let fetchSpy: unknown;
    beforeEach(() => {
        mock(mockPaths);
        wordsVerificationService = new WordsVerificationService();
        fetchSpy = chai.spy.on(wordsVerificationService, 'fetchDictionary');
    });

    afterEach(() => {
        chai.spy.restore();
        mock.restore();
    });

    it('should create', () => {
        expect(wordsVerificationService).to.exist;
    });

    it('should contain dictionary', () => {
        expect(wordsVerificationService.activeDictionaries.has(DICTIONARY_NAME)).to.be.true;
    });

    it('should return the content of dictionnary.words', () => {
        const filePath = join(__dirname, DICTIONARY_RELATIVE_PATH);
        expect(wordsVerificationService.fetchDictionary(DICTIONARY_NAME, filePath)).to.deep.equal(mockDictionary.words);
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
        expect(result).to.Throw(testWord + WORD_CONTAINS_ASTERISK);
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
