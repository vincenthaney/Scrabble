import { ValidationParameters } from './validation-parameters';

export abstract class AbstractObjective {
    constructor(public name: string, public bonusPoints: number, public progress: number, private readonly maxProgress: number) {}

    isCompleted(): boolean {
        return this.progress === this.maxProgress;
    }

    abstract isValid(validationParameters: ValidationParameters): boolean;
}
