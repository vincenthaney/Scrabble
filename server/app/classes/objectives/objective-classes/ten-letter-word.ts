import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';

export const NAME = 'Ten letter word Objective';
export const DESCRIPTION = 'Former un mot de 10 lettres ou +';
export const BONUS_POINTS = 50;
export const NUMBER_OF_LETTERS_TO_COMPLETE = 10;

export class TenLetterWord extends AbstractObjective {
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, 1);
    }

    updateProgress(validationParameters: ValidationParameters): void {
        this.progress = validationParameters.createdWords.find((createdWord: [Square, Tile][]) => createdWord.length >= NUMBER_OF_LETTERS_TO_COMPLETE)
            ? this.maxProgress
            : 0;
    }
}
