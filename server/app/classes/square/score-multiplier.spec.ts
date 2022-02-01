/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { VALID_MULTIPLIERS } from '@app/constants/game';
import { expect } from 'chai';
import { LetterScoreMultiplier, MultiplierEffect, WordScoreMultiplier } from '.';
import * as SQUARE_ERRORS from './square-errors';

describe('Score Multiplier', () => {
    const multiplierTestCases: Map<number, boolean> = new Map([
        [-1, false],
        [0, false],
        [1, false],
        [2, true],
        [3, true],
        [4, false],
    ]);

    multiplierTestCases.forEach((shouldCreate: boolean, multiplier: number) => {
        const isValid: string = shouldCreate ? 'valid' : 'invalid';
        it('Creating LetterScoreMultiplier with multiplier ' + multiplier + ' should be ' + isValid, () => {
            if (shouldCreate) {
                expect(new LetterScoreMultiplier(multiplier)).to.exist;
            } else {
                expect(() => new LetterScoreMultiplier(multiplier)).to.throw(SQUARE_ERRORS.INVALID_MULTIPLIER);
            }
        });

        it('Creating WordScoreMultiplier with multiplier ' + multiplier + ' should be ' + isValid, () => {
            if (shouldCreate) {
                expect(new WordScoreMultiplier(multiplier)).to.exist;
            } else {
                expect(() => new WordScoreMultiplier(multiplier)).to.throw(SQUARE_ERRORS.INVALID_MULTIPLIER);
            }
        });
    });

    it('LetterScoreMultiplier should have MultiplierEffect: ' + MultiplierEffect.LETTER, () => {
        const validMultiplier: number = VALID_MULTIPLIERS[0];
        const letterScoreMultiplier: LetterScoreMultiplier = new LetterScoreMultiplier(validMultiplier);

        expect(letterScoreMultiplier.getMultiplierEffect()).to.equal(MultiplierEffect.LETTER);
    });

    it('WordScoreMultiplier should have MultiplierEffect: ' + MultiplierEffect.WORD, () => {
        const validMultiplier: number = VALID_MULTIPLIERS[0];
        const wordScoreMultiplier: WordScoreMultiplier = new WordScoreMultiplier(validMultiplier);

        expect(wordScoreMultiplier.getMultiplierEffect()).to.equal(MultiplierEffect.WORD);
    });
});
