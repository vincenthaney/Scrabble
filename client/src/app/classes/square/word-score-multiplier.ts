import IScoreMultiplier from './i-score-multiplier';
import { MultiplierEffect } from './multiplier-effect';

export default class WordScoreMultiplier extends IScoreMultiplier {
    constructor(multiplier: number) {
        super(multiplier);
        this.multiplierType = MultiplierEffect.WORD;
    }
}
