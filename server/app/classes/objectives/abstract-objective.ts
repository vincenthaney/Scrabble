import { ValidationParameters } from './validation-parameters';

export abstract class AbstractObjective {
    constructor(public name: string, public bonusPoints: number, public progress: number, public maxProgress: number) {}

    isCompleted(): boolean {
        return this.progress === this.maxProgress;
    }

    abstract isValid(validationParameters: ValidationParameters): boolean;
}
