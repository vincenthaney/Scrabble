import { Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { COLORS } from '@app/constants/colors';
import { MultiplierEffect } from './multiplier-effect';

export default class SquareView {
    square: Square;
    squareSize: Vec2;
    constructor(square: Square, squareSize: Vec2) {
        this.square = square;
        this.squareSize = squareSize;
    }

    getColor(): COLORS {
        if (!this.square || !this.square.multiplier) {
            return COLORS.Beige;
        }

        const multiplier: number = this.square.multiplier.getMultiplier();
        switch (this.square.multiplier.getMultiplierType()) {
            case MultiplierEffect.LETTER:
                if (multiplier > 2) {
                    return COLORS.Letter3x;
                }
                return COLORS.Letter2x;

            case MultiplierEffect.WORD:
                if (multiplier > 2) {
                    return COLORS.Word3x;
                }
                return COLORS.Word2x;

            default:
                return COLORS.Beige;
        }
    }

    getText(): string {
        if (!this.square.multiplier || this.square.isCenter) {
            return '';
        }
        const multiplierType: string = this.square.multiplier.getMultiplierType();
        const multiplier: number = this.square.multiplier.getMultiplier();

        return `${multiplierType} x ${String(multiplier)}`;
    }
}
