/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Orientation } from '@app/classes/board';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { ConsecutivePlaceOrientation } from './consecutive-place-orientation';
chai.use(spies);

describe('Abstract Objective', () => {
    let objective: ConsecutivePlaceOrientation;

    beforeEach(() => {
        objective = new ConsecutivePlaceOrientation();
        objective.progress = 2;
        objective.progressOrientation = Orientation.Vertical;
    });

    describe('updateProgress', () => {
        it('should increment the progress if it is the same orientation', () => {
            const validationParameters = { wordPlacement: { orientation: Orientation.Vertical } } as unknown as ObjectiveValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(3);
            expect(objective.progressOrientation).to.equal(Orientation.Vertical);
        });

        it('should set to 1 the progress if it is the other orientation', () => {
            const validationParameters = { wordPlacement: { orientation: Orientation.Horizontal } } as unknown as ObjectiveValidationParameters;
            objective.updateProgress(validationParameters);
            expect(objective.progress).to.equal(1);
            expect(objective.progressOrientation).to.equal(Orientation.Horizontal);
        });
    });

    describe('clone', () => {
        it('should return a ConsecutivePlaceOrientation', () => {
            const clone = objective.clone();
            expect(clone).to.be.instanceOf(ConsecutivePlaceOrientation);
        });

        it('should make a new instance of a ConsecutivePlaceOrientation', () => {
            const clone = objective.clone();
            expect(clone).to.deep.equal(objective);
            expect(clone).not.to.equal(objective);
        });
    });
});
