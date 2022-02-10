import { expect } from 'chai';
import Player from './player';

const ID = 'id';
const DEFAULT_NAME = 'player';

describe('Player', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(ID, DEFAULT_NAME);
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(player).to.exist;
    });

    it('getTileRackPoints should return the sum of tile values', () => {
        player.tiles = [
            { value: 1, letter: 'A' },
            { value: 4, letter: 'A' },
            { value: 2, letter: 'A' },
            { value: 4, letter: 'A' },
        ];
        const expected = 11;
        expect(player.getTileRackPoints()).to.equal(expected);
    });

    it('hasTilesLeft should true if there are tiles left', () => {
        player.tiles = [
            { value: 1, letter: 'A' },
            { value: 4, letter: 'A' },
            { value: 2, letter: 'A' },
            { value: 4, letter: 'A' },
        ];
        const expected = true;
        expect(player.hasTilesLeft()).to.equal(expected);
    });

    it('hasTilesLeft should false if there are tiles left', () => {
        player.tiles = [];
        const expected = false;
        expect(player.hasTilesLeft()).to.equal(expected);
    });
});
