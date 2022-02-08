import { LetterValue } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';

export const LETTER_VALUES: LetterValue[] = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '*',
];

export const BOARD_SIZE: Vec2 = { x: 15, y: 15 };
export const UNDEFINED_BOARD_SIZE: Vec2 = { x: -1, y: -1 };
export const VALID_MULTIPLIERS: number[] = [2, 3];
