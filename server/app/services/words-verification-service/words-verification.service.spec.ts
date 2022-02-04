/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { WORD_TOO_SHORT } from '@app/constants/errors';
import { expect } from 'chai';
import { WordsVerificationService } from './words-verification.service';
import { DICTIONARY_NAME } from './words-verification.service.const';

describe('GamePlayService', () => {
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

    it('should not have any character with accent', () => {
        expect(wordsVerificationService.removeAccents('àbçdé')).to.be('abcde');
    });

    it('should return error because word too short', () => {
        expect(wordsVerificationService.verifyWords([['a']], DICTIONARY_NAME)).to.Throw(WORD_TOO_SHORT);
    });

    it('should return error because word contains hyphen', () => {
        expect(wordsVerificationService.verifyWords([['ho-la']], DICTIONARY_NAME)).to.Throw(WORD_TOO_SHORT);
    });

    it('should return error because word contains apostrophe', () => {
        expect(wordsVerificationService.verifyWords([["ho'la"]], DICTIONARY_NAME)).to.Throw(WORD_TOO_SHORT);
    });

    it('should return error because word is not in dictionary', () => {
        expect(wordsVerificationService.verifyWords([["ho'la"]], DICTIONARY_NAME)).to.Throw(WORD_TOO_SHORT);
    });
});
