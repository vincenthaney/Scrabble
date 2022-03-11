import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { expect } from 'chai';
import { StringConversion } from './string-conversion';

describe('wordsToString', () => {
    it('should return the word', () => {
        const tiles: [Square, Tile][][] = [
            [
                [{} as unknown as Square, { letter: 'A', value: 0 }],
                [{} as unknown as Square, { letter: 'C', value: 0 }],
            ],
        ];
        expect(StringConversion.wordsToString(tiles)).to.deep.equal(['AC']);
    });

    it('should return word when tile has playedLetter', () => {
        const tiles: [Square, Tile][][] = [
            [
                [{} as unknown as Square, { letter: 'A', value: 0 }],
                [{} as unknown as Square, { letter: '*', value: 0, playedLetter: 'B' }],
            ],
        ];
        expect(StringConversion.wordsToString(tiles)).to.deep.equal(['AB']);
    });
});
