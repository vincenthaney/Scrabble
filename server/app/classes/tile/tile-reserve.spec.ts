import * as mock from 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { expect } from 'chai';
import { join } from 'path';
import { LETTER_VALUES } from '@app/constants/game';
import TileReserve from './tile-reserve';
import { LetterDistributionData, LetterValue } from './tile.types';
import { tileErrors } from '@app/constants/classes-errors';
import * as TileConst from './tile.const';
import Tile from './tile';

const mockLetterDistribution: LetterDistributionData = {
    tiles: [
        { letter: 'A', amount: 5, score: 1 },
        { letter: 'B', amount: 5, score: 1 },
        { letter: 'C', amount: 5, score: 1 },
    ],
};

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPaths: any = [];
mockPaths[join(__dirname, TileConst.LETTER_DISTRIBUTION_RELATIVE_PATH)] = JSON.stringify(mockLetterDistribution);

describe('TileReserve', () => {
    let tileReserve: TileReserve;

    beforeEach(async () => {
        mock(mockPaths);

        tileReserve = new TileReserve();
        await tileReserve.init();
    });

    afterEach(() => {
        mock.restore();
    });

    it('should initialize', () => {
        expect(tileReserve.isInitialized()).to.equal(true);
    });

    it('getTilesLeft: should have specific amount of tiles', async () => {
        // eslint-disable-next-line dot-notation
        const tilesData = await TileReserve['fetchLetterDistribution']();
        const expected = tilesData.reduce((previous, tile) => {
            return previous + tile.amount;
        }, 0);
        expect(tileReserve.getTilesLeft()).to.equal(expected);
    });

    it('getTilesLeftPerLetter: should have a specific amount of tiles for each letters', async () => {
        const letterMap = tileReserve.getTilesLeftPerLetter();
        // eslint-disable-next-line dot-notation
        const tilesData = await TileReserve['fetchLetterDistribution']();
        tilesData.forEach((tile) => {
            expect(letterMap.get(tile.letter as LetterValue)).to.equal(tile.amount);
        });
    });

    it('getTilesLeftPerLetter: should have 0 for each when no letters are left', () => {
        tileReserve.getTiles(tileReserve.getTilesLeft());
        const letterMap = tileReserve.getTilesLeftPerLetter();
        LETTER_VALUES.forEach((letter) => expect(letterMap.get(letter)).to.equal(0));
    });

    it('getTiles: should throw error when get 0 tiles', () => {
        const amountToRemove = 0;
        expect(() => tileReserve.getTiles(amountToRemove)).to.throw(tileErrors.AMOUNT_MUST_BE_GREATER_THAN_1);
    });

    it('getTiles: should remove tiles when getTiles (1)', () => {
        const amountToRemove = 1;
        const totalTiles = tileReserve.getTilesLeft();
        testGetTilesOnSuccess(amountToRemove, totalTiles);
    });

    it('getTiles: should remove tiles when getTiles (2)', () => {
        const amountToRemove = 2;
        const totalTiles = tileReserve.getTilesLeft();
        testGetTilesOnSuccess(amountToRemove, totalTiles);
    });

    it('getTiles: should remove tiles when getTiles (7)', () => {
        const amountToRemove = 7;
        const totalTiles = tileReserve.getTilesLeft();
        testGetTilesOnSuccess(amountToRemove, totalTiles);
    });

    it('getTiles: should remove tiles when getTiles (max - 1)', () => {
        const totalTiles = tileReserve.getTilesLeft();
        const amountToRemove = totalTiles - 1;
        testGetTilesOnSuccess(amountToRemove, totalTiles);
    });

    it('getTiles: should remove tiles when getTiles (max)', () => {
        const totalTiles = tileReserve.getTilesLeft();
        const amountToRemove = totalTiles;
        testGetTilesOnSuccess(amountToRemove, totalTiles);
    });

    it('getTiles: should throw error when get more than amount in reserve.', () => {
        const totalTiles = tileReserve.getTilesLeft();
        const amountToRemove = totalTiles + 1;

        expect(() => tileReserve.getTiles(amountToRemove)).to.throw(tileErrors.NOT_ENOUGH_TILES);
    });

    it('swapTiles: should throw error when swapping no tiles', () => {
        const tiles: Tile[] = [];
        expect(() => tileReserve.swapTiles(tiles)).to.throw(tileErrors.AMOUNT_MUST_BE_GREATER_THAN_1);
    });

    it('swapTiles: should contain the same amount of tiles, but not the same instances (1)', () => {
        const amount = 1;
        testSwapTilesOnSuccess(amount);
    });

    it('swapTiles: should contain the same amount of tiles, but not the same instances (2)', () => {
        const amount = 2;
        testSwapTilesOnSuccess(amount);
    });

    it('swapTiles: should contain the same amount of tiles, but not the same instances (7)', () => {
        const amount = 7;
        testSwapTilesOnSuccess(amount);
    });

    it('swapTiles: should contain the same amount of tiles, but not the same instances (max - 1)', () => {
        const amount = tileReserve.getTilesLeft() / 2 - 2;
        testSwapTilesOnSuccess(amount);
    });

    it('swapTiles: should contain the same amount of tiles, but not the same instances (max)', () => {
        const amount = tileReserve.getTilesLeft() / 2 - 1;
        testSwapTilesOnSuccess(amount);
    });

    it('swapTiles: should throw error when swap more than amount in reserve', () => {
        const amount = tileReserve.getTilesLeft() / 2 + 1;
        const tiles: Tile[] = tileReserve.getTiles(amount);

        expect(() => tileReserve.swapTiles(tiles)).to.throw();
    });

    it('swapTiles: should throw error when reserve have less than 7 tiles', () => {
        const amount = tileReserve.getTilesLeft() - 3;
        const tiles: Tile[] = tileReserve.getTiles(amount - 3);

        expect(() => tileReserve.swapTiles([tiles[0]])).to.throw(tileErrors.MUST_HAVE_7_TILES_TO_SWAP);
    });

    it('swapTiles: should throw error when tile is not from reserve', () => {
        const tiles: Tile[] = [{ letter: '*', value: 0 }];
        expect(() => tileReserve.swapTiles(tiles)).to.throw(tileErrors.MUST_SWAP_WITH_TILES_ORIGINALLY_FROM_RESERVE);
    });

    it('removeTile: should throw error when tile is not in reserve', () => {
        const tile = tileReserve.getTiles(1);

        // eslint-disable-next-line dot-notation
        expect(() => tileReserve['removeTile'](tile[0])).to.throw(tileErrors.TILE_NOT_IN_RESERVE);
    });

    const testGetTilesOnSuccess = (amount: number, total: number) => {
        const removedTiles = tileReserve.getTiles(amount);
        // eslint-disable-next-line dot-notation
        const removedTilesStillInReserve = removedTiles.every((tile) => tileReserve['tiles'].includes(tile));

        expect(removedTiles.length).to.equal(amount);
        expect(tileReserve.getTilesLeft()).to.equal(total - amount);
        expect(removedTilesStillInReserve).to.equal(false);
    };

    const testSwapTilesOnSuccess = (amount: number) => {
        const tiles: Tile[] = tileReserve.getTiles(amount);
        const expectedNumberTiles = tileReserve.getTilesLeft();

        const newTiles = tileReserve.swapTiles(tiles);
        const haveTilesChanged = newTiles.every((tile) => !tiles.includes(tile));

        expect(haveTilesChanged).to.equal(true);
        expect(tileReserve.getTilesLeft()).to.equal(expectedNumberTiles);
    };
});

describe('TileReserve: uninitialized', () => {
    let tileReserve: TileReserve;

    beforeEach(async () => {
        tileReserve = new TileReserve();
    });

    it('should have attribute initialized to false', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(tileReserve.isInitialized()).to.be.false;
    });

    it('should throw error when getTile while uninitialized', () => {
        expect(() => tileReserve.getTiles(0)).to.throw(tileErrors.TILE_RESERVE_MUST_BE_INITIATED);
    });

    it('should throw error when swapTile while uninitialized', () => {
        expect(() => tileReserve.swapTiles([])).to.throw(tileErrors.TILE_RESERVE_MUST_BE_INITIATED);
    });

    it('should throw error when getTilesLeft while uninitialized', () => {
        expect(() => tileReserve.getTilesLeft()).to.throw(tileErrors.TILE_RESERVE_MUST_BE_INITIATED);
    });

    it('should throw error when getTilesLeftPerLetter while uninitialized', () => {
        expect(() => tileReserve.getTilesLeftPerLetter()).to.throw(tileErrors.TILE_RESERVE_MUST_BE_INITIATED);
    });
});
