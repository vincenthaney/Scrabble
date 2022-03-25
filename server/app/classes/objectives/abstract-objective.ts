import { ValidationParameters } from './validation-parameters';

export abstract class AbstractObjective {
    name: string;
    bonusPoints: number;
    progress: number;
    maxProgress: number;

    isCompleted(): boolean {
        return this.progress === this.maxProgress;
    }

    abstract isValid(validationParameters: ValidationParameters): boolean;
}
