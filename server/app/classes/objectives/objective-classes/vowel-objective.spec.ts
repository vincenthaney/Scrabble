/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Tile } from '@app/classes/tile';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import * as sinon from 'sinon';
import { SinonStub, stub } from 'sinon';
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
        let getLetterStub: SinonStub;

        beforeEach(() => {
            validationParameters = {
                wordPlacement: {
                    tilesToPlace: [
                        { letter: 'A', value: 0 },
                        { letter: 'B', value: 0 },
                    ],
                },
            } as ObjectiveValidationParameters;
            getLetterStub = stub(objective, <any>'getTileLetter').callsFake((tile: Tile) => tile.letter);
        });

        it('should call getTileLetter as many times as there are letters', () => {
            objective.updateProgress(validationParameters);
            expect(getLetterStub.callCount).to.equal(validationParameters.wordPlacement.tilesToPlace.length);
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

    it('getTileLetter should return playedLetter if it exists', () => {
        const tile: Tile = { letter: '*', value: 0, playedLetter: 'E' };
        expect(objective['getTileLetter'](tile)).to.equal('E');
    });

    it('getTileLetter should return letter if no playedLetter', () => {
        const tile: Tile = { letter: 'A', value: 0 };
        expect(objective['getTileLetter'](tile)).to.equal('A');
    });

    it('clone should do deep copy of object', () => {
        const clone = objective.clone();
        expect(clone).to.deep.equal(objective);
        expect(clone).not.to.equal(objective);
    });
});
