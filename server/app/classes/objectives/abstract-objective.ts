import { ObjectiveData } from '@app/classes/communication/objective-data';
import { ObjectiveState } from './objective-state';
import { ValidationParameters } from './validation-parameters';

export abstract class AbstractObjective {
    constructor(
        public name: string,
        public bonusPoints: number,
        public state: ObjectiveState,
        readonly isPublic: boolean,
        public progress: number,
        private readonly maxProgress: number,
    ) {}

    isCompleted(): boolean {
        return this.state !== ObjectiveState.NotCompleted;
    }

    convertToData(): ObjectiveData {
        return {
            state: this.state,
            progress: this.progress,
            maxProgress: this.maxProgress,
        };
    }

    abstract updateProgress(validationParameters: ValidationParameters): boolean;
}
