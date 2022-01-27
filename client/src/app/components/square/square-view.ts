import { COLORS } from '@app/classes/color-constants';
import { Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';

export interface SquareView {
    square: Square | null;
    squareSize: Vec2;
    color: COLORS;
}
