/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { BONUS_POINTS, DESCRIPTION, NAME, VowelObjective, VOWELS } from './vowel-objective';
chai.use(spies);

describe('Vowel Objective', () => {
    let objective: VowelObjective;

    beforeEach(() => {
        objective = new VowelObjective();
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
    });

    it('constructor should initialize with right attributes', () => {
        expect(objective.name).to.equal(NAME);
        expect(objective.description).to.equal(DESCRIPTION);
        expect(objective.bonusPoints).to.equal(BONUS_POINTS);
        expect(objective['maxProgress']).to.equal(VOWELS().length);
    });

    describe('updateProgress', () => {
        let validationParameters: ObjectiveValidationParameters;

        beforeEach(() => {
            validationParameters = {
                wordPlacement: {
                    tilesToPlace: [
                        { letter: 'A', value: 0 },
                        { letter: 'B', value: 0 },
                    ],
                },
            } as ObjectiveValidationParameters;
        });

        it('should update progress according to vowels played', () => {
            objective.progress = 0;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(1);
        });

        it('should not update progress twice if played two times same letter', () => {
            validationParameters = {
                wordPlacement: {
                    tilesToPlace: [
                        { letter: 'A', value: 0 },
                        { letter: 'A', value: 0 },
                    ],
                },
            } as ObjectiveValidationParameters;
            objective.progress = 0;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(1);
        });
    });

    it('clone should do deep copy of object', () => {
        const clone = objective.clone();
        expect(clone).to.deep.equal(objective);
        expect(clone).not.to.equal(objective);
    });
});
