import { ObjectiveData } from '@app/classes/communication/objective-data';
import { ObjectiveState } from './objective-state';
import { ValidationParameters } from './validation-parameters';

export abstract class AbstractObjective {
    state: ObjectiveState;

    constructor(
        public name: string,
        public bonusPoints: number,
        readonly isPublic: boolean,
        public progress: number,
        protected readonly maxProgress: number,
    ) {
        this.state = ObjectiveState.NotCompleted;
    }

    isCompleted(): boolean {
        return this.state !== ObjectiveState.NotCompleted;
    }

    convertToData(): ObjectiveData {
        return {
            name: this.name,
            state: this.state,
            isPublic: this.isPublic,
            progress: this.progress,
            maxProgress: this.maxProgress,
        };
    }

    updateObjective(validationParameters: ValidationParameters): void {
        this.updateProgress(validationParameters);

        if (this.progress >= this.maxProgress) this.state = ObjectiveState.Completed;
    }

    abstract updateProgress(validationParameters: ValidationParameters): void;
}
