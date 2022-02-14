import { Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { NO_COLOR_FOR_MULTIPLIER, NO_SQUARE_FOR_SQUARE_VIEW } from '@app/constants/classes-errors';
import { COLORS } from '@app/constants/colors';
import { MultiplierEffect, MultiplierValue } from './score-multiplier';
import { MULTIPLIER_COLOR_MAP } from './square-multiplier-to-color-map';

export default class SquareView {
    square: Square;
    squareSize: Vec2;

    constructor(square: Square, squareSize: Vec2) {
        this.square = square;
        this.squareSize = squareSize;
    }

    getColor(): COLORS {
        if (!this.square) {
            throw new Error(NO_SQUARE_FOR_SQUARE_VIEW);
        }
        if (!this.square.scoreMultiplier) {
            return COLORS.Gray;
        }

        const squareMultiplier: MultiplierValue = this.square.scoreMultiplier.multiplier;
        const squareMultiplierEffect: MultiplierEffect = this.square.scoreMultiplier.multiplierEffect;
        const multiplierToColorMap = MULTIPLIER_COLOR_MAP.get(squareMultiplierEffect);

        if (multiplierToColorMap) {
            const color = multiplierToColorMap.get(squareMultiplier);
            if (color) {
                return color;
            }
        }
        throw new Error(NO_COLOR_FOR_MULTIPLIER);
    }

    getText(): [type: string | undefined, multiplier: string | undefined] {
        if (!this.square) {
            throw new Error(NO_SQUARE_FOR_SQUARE_VIEW);
        }

        if (!this.square.scoreMultiplier || this.square.isCenter) {
            return [undefined, undefined];
        }
        const multiplierType: string = this.square.scoreMultiplier.multiplierEffect;
        const multiplier: number = this.square.scoreMultiplier.multiplier;

        return [multiplierType, `${multiplier}`];
    }
}
