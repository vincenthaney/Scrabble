import AbstractScoreMultiplier from './abstract-score-multiplier';
import { MultiplierEffect } from './multiplier-effect';

export default class WordScoreMultiplier extends AbstractScoreMultiplier {
    constructor(multiplier: number) {
        super(multiplier);
        this.multiplierType = MultiplierEffect.WORD;
    }
}
