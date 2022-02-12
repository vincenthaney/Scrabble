import { Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { MultiplierEffect } from '@app/classes/square/score-multiplier';
import { Tile } from '@app/classes/tile';

export const USED_MULTIPLIER = true;
export const NOT_USED_MULTIPLIER = false;
export const DEFAULT_TILE_VALUE = 10;
export const DEFAULT_WORD_MULTIPLIER = 2;
export const DEFAULT_LETTER_MULTIPLIER = 2;
export const EMPTY_WORDS: [Tile, Square][][] = [];
export const EMPTY_WORD: [Tile, Square][] = [];
export const GENERIC_LETTER_1: [Tile, Square] = [
    { letter: 'X', value: 10 },
    {
        tile: null,
        position: new Position(0, 0),
        scoreMultiplier: { multiplier: DEFAULT_WORD_MULTIPLIER, multiplierEffect: MultiplierEffect.WORD },
        wasMultiplierUsed: false,
        isCenter: false,
    },
];

export const GENERIC_LETTER_2: [Tile, Square] = [
    { letter: 'N', value: 1 },
    {
        tile: null,
        position: new Position(0, 0),
        scoreMultiplier: { multiplier: DEFAULT_LETTER_MULTIPLIER, multiplierEffect: MultiplierEffect.LETTER },
        wasMultiplierUsed: false,
        isCenter: false,
    },
];

export const GENERIC_LETTER_3: [Tile, Square] = [
    { letter: 'C', value: 3 },
    {
        tile: null,
        position: new Position(0, 0),
        scoreMultiplier: null,
        wasMultiplierUsed: false,
        isCenter: false,
    },
];

export const GENERIC_WORDS = [
    [GENERIC_LETTER_1, GENERIC_LETTER_3],
    [GENERIC_LETTER_1, GENERIC_LETTER_2],
];

export const GENERIC_WORDS_SCORE = 50;
