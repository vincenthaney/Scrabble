import AbstractScoreMultiplier from './abstract-score-multiplier';
import { MultiplierEffect } from './multiplier-effect';

export default class LetterScoreMultiplier extends AbstractScoreMultiplier {
    constructor(multiplier: number) {
        super(multiplier);
        this.multiplierType = MultiplierEffect.LETTER;
    }
}
