import { Tile } from '.';

describe('Tile', () => {
    it('constructor should return expected tile', () => {
        const tileLetter = 'A';
        const tileValue = 1;
        const tile = new Tile(tileLetter, tileValue);

        expect(tile.letter).toEqual(tileLetter);
        expect(tile.value).toEqual(tileValue);
    });
});
