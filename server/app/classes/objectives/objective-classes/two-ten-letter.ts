import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Square } from '@app/classes/square';
import { LetterValue, Tile } from '@app/classes/tile';
import { StringConversion } from '@app/utils/string-conversion';

export const NAME = 'Two ten points letter Objective';
export const DESCRIPTION = 'Former un mot contenant 2 lettres ou plus de 10 points';
export const BONUS_POINTS = 50;
export const LETTERS_WITH_TEN_POINTS_VALUE: LetterValue[] = ['K', 'W', 'X', 'Y', 'Z'];
export const NUMBER_OF_LETTERS_TO_USE = 2;

export class TwoTenLetter extends AbstractObjective {
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, 1);
    }

    updateProgress(validationParameters: ValidationParameters): void {
        this.progress = validationParameters.createdWords.find((createdWord: [Square, Tile][]) => {
            return createdWord.map(([, tile]) => tile).filter((tile: Tile) => this.isTileValueTenPoints(tile)).length >= NUMBER_OF_LETTERS_TO_USE;
        })
            ? this.maxProgress
            : 0;
    }

    private isTileValueTenPoints(tile: Tile): boolean {
        return LETTERS_WITH_TEN_POINTS_VALUE.includes(StringConversion.tileToString(tile) as LetterValue);
    }
}
