import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { LetterValue } from '@app/classes/tile';
import { StringConversion } from '@app/utils/string-conversion';

export const NAME = 'Les bases';
export const DESCRIPTION = 'Jouer chaque voyelle au moins une fois (inclue les lettres blanches)';
export const BONUS_POINTS = 30;
export const VOWELS = (): LetterValue[] => ['A', 'E', 'I', 'O', 'U', 'Y'];

export class VowelObjective extends AbstractObjective {
    private availableVowels: LetterValue[];

    constructor() {
        super(NAME, DESCRIPTION, BONUS_POINTS, false, VOWELS().length);
        this.availableVowels = VOWELS();
    }
    updateProgress(validationParameters: ObjectiveValidationParameters): void {
        const letterPlayed: LetterValue[] = validationParameters.wordPlacement.tilesToPlace.map(
            (t) => StringConversion.tileToString(t) as LetterValue,
        );
        letterPlayed.forEach((letter: LetterValue) => {
            if (this.availableVowels.includes(letter)) {
                this.progress++;
                this.availableVowels.splice(this.availableVowels.indexOf(letter), 1);
            }
        });
    }

    clone(): AbstractObjective {
        const clone = new VowelObjective();
        clone.progress = this.progress;
        clone.state = this.state;
        clone.isPublic = this.isPublic;
        return clone;
    }
}
