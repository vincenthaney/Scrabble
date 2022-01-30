import { MultiplierEffect } from './multiplier-effect';

export default abstract class AbstractScoreMultiplier {
    protected multiplier: number;
    protected multiplierType: MultiplierEffect;

    constructor(multiplier: number) {
        this.multiplier = multiplier;
    }
    getMultiplier(): number {
        return this.multiplier;
    }
    getMultiplierType(): MultiplierEffect {
        return this.multiplierType;
    }
}
