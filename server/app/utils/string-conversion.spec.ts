import { Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { expect } from 'chai';
import { StringConversion } from './string-conversion';

const DEFAULT_TILE_A: Tile = { letter: 'A', value: 1 };
const DEFAULT_TILE_B: Tile = { letter: 'B', value: 3 };
const DEFAULT_SQUARE_1: Square = { tile: null, position: new Position(0, 0), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };
const DEFAULT_SQUARE_2: Square = { tile: null, position: new Position(0, 1), scoreMultiplier: null, wasMultiplierUsed: false, isCenter: false };

const EXTRACT_RETURN: [Square, Tile][][] = [
    [
        [{ ...DEFAULT_SQUARE_1 }, { ...DEFAULT_TILE_A }],
        [{ ...DEFAULT_SQUARE_2 }, { ...DEFAULT_TILE_B }],
    ],
];

describe('wordToString', () => {
    it('should return the word', () => {
        expect(StringConversion.wordToString(EXTRACT_RETURN)).to.deep.equal(['AB']);
    });

    it('should return word when tile has playedLetter', () => {
        const tiles: [Square, Tile][][] = [
            [
                [{} as unknown as Square, { letter: 'A', value: 0 }],
                [{} as unknown as Square, { letter: '*', value: 0, playedLetter: 'B' }],
            ],
        ];
        expect(StringConversion.wordToString(tiles)).to.deep.equal(['AB']);
    });
});
