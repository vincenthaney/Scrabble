import IScoreMultiplier from './i-score-multiplier';
import { MultiplierEffect } from './multiplier-effect';

export default class LetterScoreMultiplier extends IScoreMultiplier {
    constructor(multiplier: number) {
        super(multiplier);
        this.multiplierType = MultiplierEffect.LETTER;
    }
}
