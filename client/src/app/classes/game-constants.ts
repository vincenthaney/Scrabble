import { Vec2 } from '@app/classes/vec2';
import { COLORS } from './color-constants';

export const BOARD_SIZE: Vec2 = { x: 15, y: 15 };
export const SQUARE_SIZE: Vec2 = { x: 1, y: 1 };
// REMOVE WHEN CHARLES MERGES TILE_RESERVED
export const GRID_MARGIN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
export const MARGIN_COLUMN_SIZE = 1;

export const DEFAULT_SQUARE_COLOR = COLORS.Beige;
export const UNDEFINED_TILE = { letter: '?', value: -1 };
export const UNDEFINED_GRID_SIZE: Vec2 = { x: 0, y: 0 };
