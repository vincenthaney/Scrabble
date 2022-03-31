/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ObjectiveData } from '@app/classes/communication/objective-data';
import { TestObjective, TEST_OBJECTIVE_MAX_PROGRESS } from '@app/constants/services-constants/objectives-test.const';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { AbstractObjective } from './abstract-objective';
import { ObjectiveState } from './objective-state';
import { ValidationParameters } from './validation-parameters';
chai.use(spies);

describe('Abstract Objective', () => {
    let objective: AbstractObjective;

    beforeEach(() => {
        objective = new TestObjective('Test', TEST_OBJECTIVE_MAX_PROGRESS);
    });

    it('constructor should set state to NotCompleted', () => {
        expect(objective.state).to.equal(ObjectiveState.NotCompleted);
    });

    describe('isCompleted default implementation', () => {
        it('should return true if State is not ObjectiveState.Completed', () => {
            objective.state = ObjectiveState.Completed;
            expect(objective.isCompleted()).to.be.true;
        });
        it('should return false if state is ObjectiveState.NotCompleted', () => {
            objective.state = ObjectiveState.NotCompleted;
            expect(objective.isCompleted()).to.be.false;
        });
    });

    it('convertToData should return ObjectiveData with right values', () => {
        const expected: ObjectiveData = {
            state: objective.state,
            progress: objective.progress,
            maxProgress: objective['maxProgress'],
        };
        const actual: ObjectiveData = objective.convertToData();
        expect(actual).to.deep.equal(expected);
    });

    describe('updateObjective', () => {
        let updateProgressSpy: unknown;
        let validationParameters: ValidationParameters;

        beforeEach(() => {
            validationParameters = {} as unknown as ValidationParameters;
            updateProgressSpy = chai.spy.on(objective, 'updateProgress', () => {});
        });
        it('should call updateProgress', () => {
            objective.updateObjective(validationParameters);
            expect(updateProgressSpy).to.have.been.called.with(validationParameters);
        });

        it('if progress exceeded maxProgress, should set state to Completed', () => {
            objective.progress = objective['maxProgress'] + 1;
            objective.updateObjective(validationParameters);
            expect(objective.state).to.equal(ObjectiveState.Completed);
        });

        it('if progress does NOT exceed maxProgress, should NOT set state to Completed', () => {
            objective.progress = objective['maxProgress'] - 1;
            objective.updateObjective(validationParameters);
            expect(objective.state).to.equal(ObjectiveState.NotCompleted);
        });
    });
});
