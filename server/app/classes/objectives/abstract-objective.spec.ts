/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { TestObjective, TEST_OBJECTIVE_MAX_PROGRESS } from '@app/constants/objectives-test.const';
import { expect } from 'chai';
import { AbstractObjective } from './abstract-objective';

describe('Abstract Objective', () => {
    let objective: AbstractObjective;

    beforeEach(() => {
        objective = new TestObjective('Test', TEST_OBJECTIVE_MAX_PROGRESS);
    });

    it('constructor should set objective fields', () => {
        expect(objective.name).to.equal('Test');
        expect(objective.bonusPoints).to.equal(0);
        expect(objective.progress).to.equal(0);
        expect(objective['maxProgress']).to.equal(TEST_OBJECTIVE_MAX_PROGRESS);
    });

    describe('isCompleted default implementation', () => {
        it('should return true if progress equals maxProgress', () => {
            objective.progress = TEST_OBJECTIVE_MAX_PROGRESS;
            expect(objective.isCompleted()).to.be.true;
        });
        it('should return false if progress DOES NOT equal maxProgress', () => {
            objective.progress = 0;
            expect(objective.isCompleted()).to.be.false;
        });
    });
});
