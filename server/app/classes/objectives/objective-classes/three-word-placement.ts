import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';

export const NAME = 'Three words placement Objective';
export const DESCRIPTION = 'Créer 3 mots en 1 placement';
export const BONUS_POINTS = 30;
export const NUMBER_OF_WORDS_TO_CREATE = 3;

export class ThreeWordsPlacement extends AbstractObjective {
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, 1);
    }

    updateProgress(validationParameters: ValidationParameters): void {
        this.progress = validationParameters.createdWords.length >= NUMBER_OF_WORDS_TO_CREATE ? this.maxProgress : 0;
    }
}
