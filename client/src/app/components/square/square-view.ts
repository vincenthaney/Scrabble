import { Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { COLORS } from '@app/constants/colors';

export interface SquareView {
    square: Square | null;
    squareSize: Vec2;
    color: COLORS;
}
