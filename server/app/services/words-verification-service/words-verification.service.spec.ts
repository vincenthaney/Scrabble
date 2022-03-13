// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import { DICTIONARY_NAME, DICTIONARY_RELATIVE_PATH } from '@app/constants/services-constants/words-verification.service.const';
import { INVALID_WORD, WORD_CONTAINS_APOSTROPHE, WORD_CONTAINS_ASTERISK, WORD_CONTAINS_HYPHEN, WORD_TOO_SHORT } from '@app/constants/services-errors';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import * as fs from 'fs';
import * as mock from 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { join } from 'path';
import { WordsVerificationService } from './words-verification.service';
import { DictionaryData } from './words-verification.service.types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import path = require('path');

chai.use(spies);
chai.use(chaiAsPromised);

const DEFAULT_DICTIONARY: DictionaryData = {
    title: 'My dummy dictionary',
    description: 'Dictionary takes one "n"',
    words: ['this', 'dummy', 'dictionary', 'gave', 'me', 'pain', 'and', 'misery'],
};

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_PATHS: any = [];
MOCK_PATHS[join(__dirname, DICTIONARY_RELATIVE_PATH, DICTIONARY_NAME)] = JSON.stringify(DEFAULT_DICTIONARY);
const FILE_PATH = join(__dirname, DICTIONARY_RELATIVE_PATH);

describe('WordsVerificationService', () => {
    let wordsVerificationService: WordsVerificationService;
    let fetchSpy: unknown;

    beforeEach(() => {
        mock(MOCK_PATHS);
        wordsVerificationService = new WordsVerificationService();
        fetchSpy = spy.on(wordsVerificationService, 'fetchDictionary');
    });

    afterEach(() => {
        chai.spy.restore();
        mock.restore();
    });

    it('should create', () => {
        expect(wordsVerificationService).to.exist;
    });

    it('should contain dictionary', () => {
        expect(wordsVerificationService['activeDictionaries'].has(DICTIONARY_NAME)).to.be.true;
    });

    it('loadAllDictionaries should call fetchDictionary method', () => {
        wordsVerificationService['loadAllDictionaries']();
        expect(fetchSpy).to.have.been.called();
    });

    it('fetchDictionary should return the content of dictionnary.words', () => {
        expect(wordsVerificationService['fetchDictionary'](DICTIONARY_NAME, FILE_PATH)).to.deep.equal(DEFAULT_DICTIONARY.words);
    });

    it('removeAccents should remove all accents', () => {
        expect(wordsVerificationService['removeAccents']('ŠšŽžÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìiíiîiïiñòóôõöùúûýÿ')).to.equal(
            'SsZzAAAAAACEEEEIIIINOOOOOUUUUYaaaaaaceeeeiiiiiiiinooooouuuyy',
        );
    });

    it('verifyWords should return error because word too short', () => {
        const testWord = 'a';
        const result = () => wordsVerificationService.verifyWords([testWord], DICTIONARY_NAME);
        expect(result).to.Throw(testWord + WORD_TOO_SHORT);
    });

    it('verifyWords should return error because word contains asterisk', () => {
        const testWord = 'ka*ak';
        const result = () => wordsVerificationService.verifyWords([testWord], DICTIONARY_NAME);
        expect(result).to.Throw(testWord + WORD_CONTAINS_ASTERISK);
    });

    it('verifyWords should return error because word contains hyphen', () => {
        const testWord = 'a-a';
        const result = () => wordsVerificationService.verifyWords([testWord], DICTIONARY_NAME);
        expect(result).to.Throw(testWord + WORD_CONTAINS_HYPHEN);
    });

    it('verifyWords should return error because word contains apostrophe', () => {
        const testWord = "aaaa'aaaa";
        const result = () => wordsVerificationService.verifyWords([testWord], DICTIONARY_NAME);
        expect(result).to.Throw(testWord + WORD_CONTAINS_APOSTROPHE);
    });

    it('verifyWords should return error if word is not in dictionary', () => {
        const testWord = 'ufdwihfewa';
        const result = () => wordsVerificationService.verifyWords([testWord], DICTIONARY_NAME);
        expect(result).to.Throw(INVALID_WORD(testWord.toUpperCase()));
    });

    it('verifyWords should throw error if dictionary does not exist', () => {
        const testWord = 'ufdwihfewa';
        const result = () => wordsVerificationService.verifyWords([testWord], 'truc');
        expect(result).to.Throw(INVALID_WORD(testWord.toUpperCase()));
    });

    it('verifyWords should NOT throw error when word is in the dictionary(one word)', () => {
        const wordsCount = 1;
        const words: string[] = [];
        const dictionary = wordsVerificationService['activeDictionaries'].get(DICTIONARY_NAME);

        if (dictionary) {
            const dictionaryIterator = dictionary[Symbol.iterator]();
            let i = 0;
            while (i < wordsCount) {
                words.push(dictionaryIterator.next().value);
                i++;
            }
        }
        expect(() => wordsVerificationService.verifyWords(words, DICTIONARY_NAME)).to.not.throw();
    });

    it('verifyWords should NOT throw error when word is in the dictionary (multiple words)', () => {
        const wordsCount = 4;
        const words: string[] = [];
        const dictionary = wordsVerificationService['activeDictionaries'].get(DICTIONARY_NAME);

        if (dictionary) {
            const dictionaryIterator = dictionary[Symbol.iterator]();
            let i = 0;
            while (i < wordsCount) {
                words.push(dictionaryIterator.next().value);
                i++;
            }
        }
        expect(() => wordsVerificationService.verifyWords(words, DICTIONARY_NAME)).to.not.throw();
    });

    it('verifyWords should call removeAccents if a word has length > 0', () => {
        const words: string[] = ['dummy', 'dictionary'];
        const removeAccentsSpy = spy.on(wordsVerificationService, 'removeAccents');
        spy.on(wordsVerificationService['activeDictionaries'], 'get', () => undefined);
        try {
            wordsVerificationService.verifyWords(words, DICTIONARY_NAME);
            // eslint-disable-next-line no-empty
        } catch (exception) {}
        expect(removeAccentsSpy).to.have.been.called();
    });

    it('verifyWords should NOT call removeAccents if a word has length > 0', () => {
        const words: string[] = [''];
        const removeAccentsSpy = spy.on(wordsVerificationService, 'removeAccents', () => {
            return;
        });
        wordsVerificationService.verifyWords(words, DICTIONARY_NAME);
        expect(removeAccentsSpy).to.not.have.been.called();
    });

    it('fetchDictionary should call appropriate functions', () => {
        const readFileSyncSpy = spy.on(fs, 'readFileSync');
        spy.on(Buffer.prototype, 'toString');
        const jsonParseSpy = spy.on(JSON, 'parse');

        wordsVerificationService['fetchDictionary'](DICTIONARY_NAME, FILE_PATH);
        expect(readFileSyncSpy).to.have.been.called();
        expect(jsonParseSpy).to.have.been.called();
    });

    it('loadAllDictionaries should call appropriate functions', () => {
        const joinSpy = spy.on(path, 'join');
        const readdirSyncSpy = spy.on(fs, 'readdirSync');

        wordsVerificationService['loadAllDictionaries']();
        expect(readdirSyncSpy).to.have.been.called();
        expect(joinSpy).to.have.been.called();
    });
});
