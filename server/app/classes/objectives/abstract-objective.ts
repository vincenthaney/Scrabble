import { ObjectiveData } from '@app/classes/communication/objective-data';
import { ObjectiveState } from './objective-state';
import { ValidationParameters } from './validation-parameters';

export abstract class AbstractObjective {
    progress: number = 0;
    state: ObjectiveState = ObjectiveState.NotCompleted;

    constructor(
        public name: string,
        public description: string,
        public bonusPoints: number,
        public isPublic: boolean,
        protected readonly maxProgress: number,
    ) {}

    isCompleted(): boolean {
        return this.state !== ObjectiveState.NotCompleted;
    }

    convertToData(): ObjectiveData {
        return {
            name: this.name,
            description: this.description,
            bonusPoints: this.bonusPoints,
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
