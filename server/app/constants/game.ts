import { LetterValue } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';

export const LETTER_VALUES: LetterValue[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '*',
];

export const BOARD_SIZE: Vec2 = { x: 15, y: 15 };
export const UNDEFINED_BOARD_SIZE: Vec2 = { x: -1, y: -1 };
export const VALID_MULTIPLIERS: number[] = [2, 3];

export const SYSTEM_ID = 'system';
export const SYSTEM_ERROR_ID = 'system-error';
