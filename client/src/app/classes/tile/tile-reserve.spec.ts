import { LETTER_VALUES } from '@app/constants/game';
import { reduce } from '@app/utils/array';
import Tile from './tile';
import TileReserve from './tile-reserve';
import TILES from './tile-reserve.data';
import * as TilesError from './tiles.errors';

describe('TileReserve Test', () => {
    let tileReserve: TileReserve;

    beforeEach(() => {
        tileReserve = new TileReserve();
    });

    it('getTilesLeft: should have specific amount of tiles', () => {
        const expected = reduce(TILES, 0, (previous, tile) => {
            return previous + tile.amount;
        });
        expect(tileReserve.getTilesLeft()).toBe(expected);
    });

    it('getTilesLeftPerLetter: should have a specific amount of tiles for each letters', () => {
        const letterMap = tileReserve.getTilesLeftPerLetter();
        TILES.forEach((tile) => {
            expect(letterMap.get(tile.letter)).toBe(tile.amount);
        });
    });

    it('getTilesLeftPerLetter: should have 0 for each when no letters are left', () => {
        tileReserve.getTiles(tileReserve.getTilesLeft());
        const letterMap = tileReserve.getTilesLeftPerLetter();
        LETTER_VALUES.forEach((letter) => expect(letterMap.get(letter)).toBe(0));
    });

    it('getTiles: should throw error when get 0 tiles', () => {
        const amountToRemove = 0;
        expect(() => tileReserve.getTiles(amountToRemove)).toThrowError(TilesError.AMOUNT_MUST_BE_GREATER_THAN_1);
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

        expect(() => tileReserve.getTiles(amountToRemove)).toThrowError(TilesError.NOT_ENOUGH_TILES);
    });

    it('swapTiles: should throw error when swapping no tiles', () => {
        const tiles: Tile[] = [];
        expect(() => tileReserve.swapTiles(tiles)).toThrowError(TilesError.AMOUNT_MUST_BE_GREATER_THAN_1);
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
        const amount = tileReserve.getTilesLeft() / 2 - 1;
        testSwapTilesOnSuccess(amount);
    });

    it('swapTiles: should contain the same amount of tiles, but not the same instances (max)', () => {
        const amount = tileReserve.getTilesLeft() / 2;
        testSwapTilesOnSuccess(amount);
    });

    it('swapTiles: should throw error when swap more than amount in reserve', () => {
        const amount = tileReserve.getTilesLeft() / 2 + 1;
        const tiles: Tile[] = tileReserve.getTiles(amount);

        expect(() => tileReserve.swapTiles(tiles)).toThrowError();
    });

    it('swapTiles: should throw error when reserve have less than 7 tiles', () => {
        const amount = tileReserve.getTilesLeft() - 3;
        const tiles: Tile[] = tileReserve.getTiles(amount - 3);

        expect(() => tileReserve.swapTiles([tiles[0]])).toThrowError(TilesError.MUST_HAVE_7_TILES_TO_SWAP);
    });

    it('swapTiles: should throw error when tile is not from reserve', () => {
        const tiles: Tile[] = [{ letter: '*', value: 0 }];
        expect(() => tileReserve.swapTiles(tiles)).toThrowError(TilesError.MUST_SWAP_WITH_TILES_ORIGINALLY_FROM_RESERVE);
    });

    it('removeTile: should throw error when tile is not in reserve', () => {
        const tile = tileReserve.getTiles(1);

        // eslint-disable-next-line dot-notation
        expect(() => tileReserve['removeTile'](tile[0])).toThrowError(TilesError.TILE_NOT_IN_RESERVE);
    });

    const testGetTilesOnSuccess = (amount: number, total: number) => {
        const removedTiles = tileReserve.getTiles(amount);
        // eslint-disable-next-line dot-notation
        const removedTilesStillInReserve = removedTiles.every((tile) => tileReserve['tiles'].includes(tile));

        expect(removedTiles).toHaveSize(amount);
        expect(tileReserve.getTilesLeft()).toBe(total - amount);
        expect(removedTilesStillInReserve).toBeFalse();
    };

    const testSwapTilesOnSuccess = (amount: number) => {
        const tiles: Tile[] = tileReserve.getTiles(amount);
        const expectedNumberTiles = tileReserve.getTilesLeft();

        const newTiles = tileReserve.swapTiles(tiles);
        const haveTilesChanged = newTiles.every((tile) => !tiles.includes(tile));

        expect(haveTilesChanged).toBeTrue();
        expect(tileReserve.getTilesLeft()).toBe(expectedNumberTiles);
    };
});
