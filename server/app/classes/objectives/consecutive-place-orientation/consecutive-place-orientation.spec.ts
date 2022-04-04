/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { ObjectiveData } from '@app/classes/communication/objective-data';
import { TestObjective } from '@app/constants/services-constants/objectives-test.const';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { SinonStub, stub } from 'sinon';
import { AbstractObjective } from './abstract-objective';
import { ConsecutivePlaceOrientation } from './consecutive-place-orientation';
import { ObjectiveState } from './objective';
import { ObjectiveValidationParameters } from './validation-parameters';
chai.use(spies);

describe('Abstract Objective', () => {
    let objective: AbstractObjective;

    beforeEach(() => {
        objective = new ConsecutivePlaceOrientation();
    });

    describe('updateObjective', () => {
        let isCompletedStub: SinonStub;
        let updateProgressSpy: unknown;
        let validationParameters: ObjectiveValidationParameters;

        beforeEach(() => {
            isCompletedStub = stub(objective, 'isCompleted').returns(false);
            validationParameters = {} as unknown as ObjectiveValidationParameters;
            updateProgressSpy = chai.spy.on(objective, 'updateProgress', () => {});
        });

        afterEach(() => {
            isCompletedStub.restore();
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

        it('should return false if objective is already completed', () => {
            isCompletedStub.returns(true);
            expect(objective.updateObjective(validationParameters)).to.be.false;
        });

        it('should return true if objective is NOT completed', () => {
            isCompletedStub.returns(false);
            expect(objective.updateObjective(validationParameters)).to.be.true;
        });
    });
});
