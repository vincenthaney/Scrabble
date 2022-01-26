import { Tile } from '@app/classes/tile';
import { LETTER_VALUES } from '@app/constants/game';
import TILES from './tile-reserve.data';
import { LetterValue } from './tile.types';
import TileError from './tiles.errors';

const RESERVE_THRESHOLD = 7;

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
        if (amount < 1) throw new Error(TileError.AMOUNT_MUST_BE_GREATER_THAN_1);
        if (this.tiles.length < amount) throw new Error(TileError.NOT_ENOUGH_TILES);

        const tilesToReturn: Tile[] = [];
        for (let i = 0; i < amount; ++i) {
            const tile = this.tiles[Math.floor(Math.random() * this.tiles.length)];
            tilesToReturn.push(tile);
            this.removeTile(tile);
        }
        return tilesToReturn;
    }

    swapTiles(tilesToSwap: Tile[]): Tile[] {
        if (this.tiles.length < tilesToSwap.length) throw new Error(TileError.NOT_ENOUGH_TILES);
        if (this.tiles.length < RESERVE_THRESHOLD) throw new Error(TileError.MUST_HAVE_7_TILES_TO_SWAP);
        if (tilesToSwap.some((tile) => !this.referenceTiles.includes(tile))) throw new Error(TileError.MUST_SWAP_WITH_TILES_ORIGINALLY_FROM_RESERVE);

        const tilesToReturn: Tile[] = this.getTiles(tilesToSwap.length);
        this.tiles = this.tiles.concat(tilesToSwap);

        return tilesToReturn;
    }

    getTilesLeft(): number {
        return this.tiles.length;
    }

    getTilesLeftPerLetter(): Map<LetterValue, number> {
        const map = new Map<LetterValue, number>();

        LETTER_VALUES.forEach((letter) => {
            map.set(letter, this.tiles.filter((t) => t.letter === letter).length);
        });

        return map;
    }

    private removeTile(tile: Tile): void {
        const index = this.tiles.indexOf(tile);
        if (index < 0) throw new Error(TileError.TILE_NOT_IN_RESERVE);
        this.tiles.splice(index, 1);
    }
}
