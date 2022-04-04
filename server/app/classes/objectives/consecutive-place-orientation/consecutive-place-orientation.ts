import { Orientation } from '@app/classes/board';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';

export const NAME = 'Entêtement';
export const DESCRIPTION = "Faire des placements dans la même orientation 5 fois d'affilée";
export const BONUS_POINTS = 70;
export const SHOULD_RESET = true;
export const MAX_PROGRESS = 5;

export class ConsecutivePlaceOrientation extends AbstractObjective {
    currentOrientation: Orientation;
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, SHOULD_RESET, MAX_PROGRESS);
        this.currentOrientation = Orientation.Horizontal;
    }

    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        if (this.currentOrientation === validationParameters.wordPlacement.orientation) this.progress++;
        else this.progress = 1;
    }
    clone(): AbstractObjective {
        const clone = new ConsecutivePlaceOrientation();
        clone.progress = this.progress;
        clone.currentOrientation = this.currentOrientation;
        return clone;
    }
}
