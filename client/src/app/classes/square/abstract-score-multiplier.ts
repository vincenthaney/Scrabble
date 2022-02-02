import { VALID_MULTIPLIERS } from '@app/constants/game';
import { MultiplierEffect } from './multiplier-effect';
import * as SQUARE_ERROR from './square-errors';

export default abstract class AbstractScoreMultiplier {
    protected multiplierEffect: MultiplierEffect;
    private multiplier: number;

    constructor(multiplier: number) {
        if (!VALID_MULTIPLIERS.includes(multiplier)) {
            throw new Error(SQUARE_ERROR.INVALID_MULTIPLIER);
        }
        this.multiplier = multiplier;
    }
    getMultiplier(): number {
        return this.multiplier;
    }
    getMultiplierEffect(): MultiplierEffect {
        return this.multiplierEffect;
    }
}
