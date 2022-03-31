import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import { LetterValue, Tile } from '@app/classes/tile';

export const BONUS_POINTS = 30;
export const VOWELS: LetterValue[] = ['A', 'E', 'I', 'O', 'U', 'Y'];

export class VowelObjective extends AbstractObjective {
    constructor() {
        super('Vowel Objective', 'Jouer chaque voyelle au moins une fois (inclue les lettres blanches)', BONUS_POINTS, false, VOWELS.length);
    }
    updateProgress(validationParameters: ValidationParameters): void {
        const letterPlayed: LetterValue[] = validationParameters.wordPlacement.tilesToPlace.map((t) => this.getTileLetter(t));
        this.progress += letterPlayed.filter((letter: LetterValue) => VOWELS.includes(letter)).length;
    }

    private getTileLetter(tile: Tile): LetterValue {
        return tile.playedLetter ? tile.playedLetter : tile.letter;
    }
}
