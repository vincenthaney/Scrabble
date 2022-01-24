import { Tile } from '@app/classes/tile';
import TILES from './tile-reserve.data';
import { LetterValue } from './tile.types';

const UPPER = 1;
const LOWER = -1;

export default class TileReserve {
    private tiles: Tile[];
    private referenceTiles: Tile[];

    constructor() {
        this.tiles = TileReserve.initTiles();
        this.referenceTiles = [...this.tiles];
    }

    private static initTiles(): Tile[] {
        const tiles: Tile[] = [];
        TILES.forEach((tile) => {
            for (let i = 0; i < tile.amount; ++i) {
                tiles.push({ letter: tile.letter, value: tile.score });
            }
        });
        return tiles;
    }

    getTiles(amount: number): Tile[] {
        if (amount < 1) throw new Error('Amount must be a positive number greater than 1.');
        if (this.tiles.length < amount) throw new Error(`Not enough tile. (${this.tiles.length} < ${amount})`);

        const tiles: Tile[] = [];
        for (let i = 0; i < amount; ++i) {
            const tile = this.tiles[Math.floor(Math.random() * this.tiles.length)];
            tiles.push(tile);
            this.removeTile(tile);
        }
        return tiles;
    }

    swapTiles(tiles: Tile[]): Tile[] {
        if (this.tiles.length < tiles.length) throw new Error(`Not enough tile. (${this.tiles.length} < ${tiles.length})`);
        if (tiles.some((tile) => !this.referenceTiles.includes(tile))) throw new Error('Must swap tiles from tiles originally in reserve.');

        const newTiles: Tile[] = this.getTiles(tiles.length);
        this.tiles = this.tiles.concat(tiles);

        return newTiles;
    }

    getTilesLeft(): number {
        return this.tiles.length;
    }

    getTilesLeftPerLetter(): Map<LetterValue, number> {
        const sortedTiles = this.tiles.sort((a, b) => (a.letter > b.letter ? UPPER : LOWER));
        const map = new Map<LetterValue, number>();

        let lastLetter: LetterValue | undefined;
        let letterCount = 0;
        sortedTiles.forEach((tile) => {
            if (tile.letter !== lastLetter) {
                if (lastLetter !== undefined) {
                    map.set(lastLetter, letterCount);
                }
                lastLetter = tile.letter;
                letterCount = 1;
            } else {
                letterCount++;
            }
        });
        if (lastLetter !== undefined) map.set(lastLetter, letterCount);

        return map;
    }

    private removeTile(tile: Tile): void {
        const index = this.tiles.indexOf(tile);
        if (index < 0) throw new Error('Tile is not in reserve.');
        this.tiles.splice(index, 1);
    }
}
