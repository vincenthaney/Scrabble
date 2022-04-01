import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { LetterValue, Tile } from '@app/classes/tile';

export const NAME = 'Vowel Objective';
export const DESCRIPTION = 'Jouer chaque voyelle au moins une fois (inclue les lettres blanches)';
export const BONUS_POINTS = 30;
export const VOWELS: LetterValue[] = ['A', 'E', 'I', 'O', 'U', 'Y'];

export class VowelObjective extends AbstractObjective {
    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, false, VOWELS.length);
    }
    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        const letterPlayed: LetterValue[] = validationParameters.wordPlacement.tilesToPlace.map((t) => this.getTileLetter(t));
        this.progress += letterPlayed.filter((letter: LetterValue) => VOWELS.includes(letter)).length;
    }

    clone(): AbstractObjective {
        const clone = new VowelObjective();
        clone.progress = this.progress;
        clone.state = this.state;
        clone.isPublic = this.isPublic;
        return clone;
    }

    private getTileLetter(tile: Tile): LetterValue {
        return tile.playedLetter ? tile.playedLetter : tile.letter;
    }
}
