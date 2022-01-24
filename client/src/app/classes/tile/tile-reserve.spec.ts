import { reduce } from '@app/utils/array';
import Tile from './tile';
import TileReserve from './tile-reserve';
import TILES from './tile-reserve.data';

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

    it('getTiles: should throw error when get 0 tiles', () => {
        const amountToRemove = 0;
        expect(() => tileReserve.getTiles(amountToRemove)).toThrowError('Amount must be a positive number greater than 1.');
    });

    it('getTiles: should remove tiles when getTiles (1)', () => {
        const amountToRemove = 1;
        const totalTiles = tileReserve.getTilesLeft();

        expect(tileReserve.getTiles(amountToRemove)).toHaveSize(amountToRemove);
        expect(tileReserve.getTilesLeft()).toBe(totalTiles - amountToRemove);
    });

    it('getTiles: should remove tiles when getTiles (2)', () => {
        const amountToRemove = 2;
        const totalTiles = tileReserve.getTilesLeft();

        expect(tileReserve.getTiles(amountToRemove)).toHaveSize(amountToRemove);
        expect(tileReserve.getTilesLeft()).toBe(totalTiles - amountToRemove);
    });

    it('getTiles: should remove tiles when getTiles (7)', () => {
        const amountToRemove = 7;
        const totalTiles = tileReserve.getTilesLeft();

        expect(tileReserve.getTiles(amountToRemove)).toHaveSize(amountToRemove);
        expect(tileReserve.getTilesLeft()).toBe(totalTiles - amountToRemove);
    });

    it('getTiles: should remove tiles when getTiles (max - 1)', () => {
        const totalTiles = tileReserve.getTilesLeft();
        const amountToRemove = totalTiles - 1;

        expect(tileReserve.getTiles(amountToRemove)).toHaveSize(amountToRemove);
        expect(tileReserve.getTilesLeft()).toBe(totalTiles - amountToRemove);
    });

    it('getTiles: should remove tiles when getTiles (max)', () => {
        const totalTiles = tileReserve.getTilesLeft();
        const amountToRemove = totalTiles;

        expect(tileReserve.getTiles(amountToRemove)).toHaveSize(amountToRemove);
        expect(tileReserve.getTilesLeft()).toBe(totalTiles - amountToRemove);
    });

    it('getTiles: should throw error when get more than amount in reserve.', () => {
        const totalTiles = tileReserve.getTilesLeft();
        const amountToRemove = totalTiles + 1;

        expect(() => tileReserve.getTiles(amountToRemove)).toThrowError(`Not enough tile. (${totalTiles} < ${amountToRemove})`);
    });

    it('swapTiles: should throw error when swapping no tiles', () => {
        const tiles: Tile[] = [];
        expect(() => tileReserve.swapTiles(tiles)).toThrowError('Amount must be a positive number greater than 1.');
    });

    it('swapTiles: should have the same amount of tiles, but not the same when swapTiles (1)', () => {
        const amount = 1;
        const tiles: Tile[] = tileReserve.getTiles(amount);
        const expectedNumberTiles = tileReserve.getTilesLeft();

        const newTiles = tileReserve.swapTiles(tiles);
        const haveTilesChanged = newTiles.every((tile) => !tiles.includes(tile));

        expect(haveTilesChanged).toBeTrue();
        expect(tileReserve.getTilesLeft()).toBe(expectedNumberTiles);
    });

    it('swapTiles: should have the same amount of tiles, but not the same when swapTiles (2)', () => {
        const amount = 2;
        const tiles: Tile[] = tileReserve.getTiles(amount);
        const expectedNumberTiles = tileReserve.getTilesLeft();

        const newTiles = tileReserve.swapTiles(tiles);
        const haveTilesChanged = newTiles.every((tile) => !tiles.includes(tile));

        expect(haveTilesChanged).toBeTrue();
        expect(tileReserve.getTilesLeft()).toBe(expectedNumberTiles);
    });

    it('swapTiles: should have the same amount of tiles, but not the same when swapTiles (7)', () => {
        const amount = 7;
        const tiles: Tile[] = tileReserve.getTiles(amount);
        const expectedNumberTiles = tileReserve.getTilesLeft();

        const newTiles = tileReserve.swapTiles(tiles);
        const haveTilesChanged = newTiles.every((tile) => !tiles.includes(tile));

        expect(haveTilesChanged).toBeTrue();
        expect(tileReserve.getTilesLeft()).toBe(expectedNumberTiles);
    });

    it('swapTiles: should have the same amount of tiles, but not the same when swapTiles (max - 1)', () => {
        const amount = tileReserve.getTilesLeft() / 2 - 1;
        const tiles: Tile[] = tileReserve.getTiles(amount);
        const expectedNumberTiles = tileReserve.getTilesLeft();

        const newTiles = tileReserve.swapTiles(tiles);
        const haveTilesChanged = newTiles.every((tile) => !tiles.includes(tile));

        expect(haveTilesChanged).toBeTrue();
        expect(tileReserve.getTilesLeft()).toBe(expectedNumberTiles);
    });

    it('swapTiles: should have the same amount of tiles, but not the same when swapTiles (max)', () => {
        const amount = tileReserve.getTilesLeft() / 2;
        const tiles: Tile[] = tileReserve.getTiles(amount);
        const expectedNumberTiles = tileReserve.getTilesLeft();

        const newTiles = tileReserve.swapTiles(tiles);
        const haveTilesChanged = newTiles.every((tile) => !tiles.includes(tile));

        expect(haveTilesChanged).toBeTrue();
        expect(tileReserve.getTilesLeft()).toBe(expectedNumberTiles);
    });

    it('swapTiles: should throw error when swap more than amount in reserve', () => {
        const amount = tileReserve.getTilesLeft() / 2 + 1;
        const tiles: Tile[] = tileReserve.getTiles(amount);

        expect(() => tileReserve.swapTiles(tiles)).toThrowError();
    });

    it('swapTiles: should throw error when tile is not from reserve', () => {
        const tiles: Tile[] = [{ letter: '*', value: 999 }];
        expect(() => tileReserve.swapTiles(tiles)).toThrowError('Must swap tiles from tiles originally in reserve.');
    });

    it('removeTile: should throw error when tile is not in reserve', () => {
        const tile = tileReserve.getTiles(1);

        // eslint-disable-next-line dot-notation
        expect(() => tileReserve['removeTile'](tile[0])).toThrowError('Tile is not in reserve.');
    });
});
