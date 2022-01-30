import { Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { COLORS } from '@app/constants/colors';
import { MultiplierEffect } from './multiplier-effect';
import * as SQUARE_ERRORS from './square-errors';
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
            throw new Error(SQUARE_ERRORS.NO_SQUARE_FOR_SQUARE_VIEW);
        }
        if (!this.square.multiplier) {
            return COLORS.Beige;
        }

        const squareMultiplier: number = this.square.multiplier.getMultiplier();
        const squareMultiplierEffect: MultiplierEffect = this.square.multiplier.getMultiplierEffect();
        const multiplierToColorMap = MULTIPLIER_COLOR_MAP.get(squareMultiplierEffect);

        if (multiplierToColorMap) {
            const color = multiplierToColorMap.get(squareMultiplier);
            if (color) {
                return color;
            }
        }
        throw new Error(SQUARE_ERRORS.NO_COLOR_FOR_MULTIPLIER);
    }

    getText(): string {
        if (!this.square) {
            throw new Error(SQUARE_ERRORS.NO_SQUARE_FOR_SQUARE_VIEW);
        }

        if (!this.square.multiplier || this.square.isCenter) {
            return '';
        }
        const multiplierType: string = this.square.multiplier.getMultiplierEffect();
        const multiplier: number = this.square.multiplier.getMultiplier();

        return `${multiplierType} x ${String(multiplier)}`;
    }
}
