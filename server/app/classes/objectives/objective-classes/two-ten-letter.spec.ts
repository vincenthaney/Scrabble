/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Tile } from '@app/classes/tile';
import { DEFAULT_SQUARE } from '@app/classes/word-finding/helper.spec';
import { StringConversion } from '@app/utils/string-conversion';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { LETTERS_WITH_TEN_POINTS_VALUE, TwoTenLetter } from './two-ten-letter';
chai.use(spies);

describe.only('Vowel Objective', () => {
    let objective: TwoTenLetter;

    beforeEach(() => {
        objective = new TwoTenLetter();
    });

    afterEach(() => {
        chai.spy.restore();
    });

    describe('updateProgress', () => {
        let validationParameters: ValidationParameters;

        it('should set progress to maxProgress if created words contain two ten points letters', () => {
            validationParameters = {
                createdWords: [
                    [
                        [DEFAULT_SQUARE, { letter: LETTERS_WITH_TEN_POINTS_VALUE[0], value: 10 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 1 }],
                        [DEFAULT_SQUARE, { letter: LETTERS_WITH_TEN_POINTS_VALUE[1], value: 10 }],
                    ],
                ],
            } as ValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(objective['maxProgress']);
        });

        it('should set progress to 0 if created words DO NOT contain two ten points letters', () => {
            validationParameters = {
                createdWords: [
                    [
                        [DEFAULT_SQUARE, { letter: 'L', value: 1 }],
                        [DEFAULT_SQUARE, { letter: 'O', value: 1 }],
                        [DEFAULT_SQUARE, { letter: 'L', value: 1 }],
                    ],
                ],
            } as ValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(0);
        });
    });

    it('isTileValueTenPoints should return true if letter is in defined array', () => {
        const tile: Tile = { letter: 'Z', value: 10 };
        chai.spy.on(StringConversion, 'tileToString', (t: Tile) => t.letter);
        expect(objective['isTileValueTenPoints'](tile)).to.be.true;
    });

    it('isTileValueTenPoints should return false if letter is in defined array', () => {
        const tile: Tile = { letter: 'A', value: 0 };
        chai.spy.on(StringConversion, 'tileToString', (t: Tile) => t.letter);
        expect(objective['isTileValueTenPoints'](tile)).to.be.false;
    });
});
