// Lint dot-notation must be disabled to access private element
/* eslint-disable dot-notation */
// Lint no unused expression must be disabled to use chai syntax
/* eslint-disable @typescript-eslint/no-unused-expressions, no-unused-expressions */
import { INVALID_WORD, WORD_CONTAINS_APOSTROPHE, WORD_CONTAINS_ASTERISK, WORD_CONTAINS_HYPHEN, WORD_TOO_SHORT } from '@app/constants/services-errors';
import * as chai from 'chai';
import { expect, spy } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { WordsVerificationService } from './words-verification.service';
import { Container } from 'typedi';
import { DEFAULT_DICTIONARY_NAME } from '@app/constants/dictionary.const';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { dictionaryTestService } from '@app/services/dictionary-service/dictionary-test.service.spec';

chai.use(spies);
chai.use(chaiAsPromised);

describe('WordsVerificationService', () => {
    let wordsVerificationService: WordsVerificationService;

    beforeEach(() => {
        Container.set(DictionaryService, dictionaryTestService);
        wordsVerificationService = Container.get(WordsVerificationService);
    });

    it('should create', () => {
        expect(wordsVerificationService).to.exist;
    });

    describe('removeAccents', () => {
        it('should remove all accents', () => {
            expect(wordsVerificationService['removeAccents']('ŠšŽžÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìiíiîiïiñòóôõöùúûýÿ')).to.equal(
                'SsZzAAAAAACEEEEIIIINOOOOOUUUUYaaaaaaceeeeiiiiiiiinooooouuuyy',
            );
        });
    });

    describe('verifyWords', () => {
        it('should return error because word too short', () => {
            const testWord = 'a';
            const result = () => wordsVerificationService.verifyWords([testWord], DEFAULT_DICTIONARY_NAME);
            expect(result).to.Throw(testWord + WORD_TOO_SHORT);
        });

        it('should return error because word contains asterisk', () => {
            const testWord = 'ka*ak';
            const result = () => wordsVerificationService.verifyWords([testWord], DEFAULT_DICTIONARY_NAME);
            expect(result).to.Throw(testWord + WORD_CONTAINS_ASTERISK);
        });

        it('should return error because word contains hyphen', () => {
            const testWord = 'a-a';
            const result = () => wordsVerificationService.verifyWords([testWord], DEFAULT_DICTIONARY_NAME);
            expect(result).to.Throw(testWord + WORD_CONTAINS_HYPHEN);
        });

        it('should return error because word contains apostrophe', () => {
            const testWord = "aaaa'aaaa";
            const result = () => wordsVerificationService.verifyWords([testWord], DEFAULT_DICTIONARY_NAME);
            expect(result).to.Throw(testWord + WORD_CONTAINS_APOSTROPHE);
        });

        it('should return error if word is not in dictionary', () => {
            const testWord = 'ufdwihfewa';
            const result = () => wordsVerificationService.verifyWords([testWord], DEFAULT_DICTIONARY_NAME);
            expect(result).to.Throw(INVALID_WORD(testWord.toUpperCase()));
        });

        it('should throw error if dictionary does not exist', () => {
            const testWord = 'ufdwihfewa';
            const result = () => wordsVerificationService.verifyWords([testWord], 'truc');
            expect(result).to.Throw(INVALID_WORD(testWord.toUpperCase()));
        });

        it('should NOT throw error when word is in the dictionary(one word)', () => {
            const wordsCount = 1;
            const words: string[] = [];
            const dictionary = wordsVerificationService['activeDictionaries'].get(DEFAULT_DICTIONARY_NAME);

            if (dictionary) {
                const dictionaryIterator = dictionary[Symbol.iterator]();
                let i = 0;
                while (i < wordsCount) {
                    words.push(dictionaryIterator.next().value);
                    i++;
                }
            }
            expect(() => wordsVerificationService.verifyWords(words, DEFAULT_DICTIONARY_NAME)).to.not.throw();
        });

        it('should NOT throw error when word is in the dictionary (multiple words)', () => {
            const wordsCount = 4;
            const words: string[] = [];
            const dictionary = wordsVerificationService['activeDictionaries'].get(DEFAULT_DICTIONARY_NAME);

            if (dictionary) {
                const dictionaryIterator = dictionary[Symbol.iterator]();
                let i = 0;
                while (i < wordsCount) {
                    words.push(dictionaryIterator.next().value);
                    i++;
                }
            }
            expect(() => wordsVerificationService.verifyWords(words, DEFAULT_DICTIONARY_NAME)).to.not.throw();
        });

        it('should call removeAccents if a word', () => {
            const words: string[] = ['dummy', 'dictionary'];
            const removeAccentsSpy = spy.on(wordsVerificationService, 'removeAccents');
            spy.on(wordsVerificationService['activeDictionaries'], 'get', () => undefined);
            try {
                wordsVerificationService.verifyWords(words, DEFAULT_DICTIONARY_NAME);
                // eslint-disable-next-line no-empty
            } catch (exception) {}
            expect(removeAccentsSpy).to.have.been.called();
        });

        it('should NOT call removeAccents if a word', () => {
            const words: string[] = [''];
            const removeAccentsSpy = spy.on(wordsVerificationService, 'removeAccents', () => {
                return;
            });
            wordsVerificationService.verifyWords(words, DEFAULT_DICTIONARY_NAME);
            expect(removeAccentsSpy).to.not.have.been.called();
        });
    });
});
