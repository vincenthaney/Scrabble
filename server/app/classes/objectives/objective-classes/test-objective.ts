import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';

class TestObjective extends AbstractObjective {
    constructor() {
        super('Test', 1, false, 0, 3);
    }
    // eslint-disable-next-line no-unused-vars
    updateProgress(validationParameters: ValidationParameters): void {
        this.progress = this.maxProgress;
    }
}

module.exports = { outClass: TestObjective };
