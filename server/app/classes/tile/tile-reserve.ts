import { LetterValue, Tile } from '@app/classes/tile';
import { LETTER_DISTRIBUTION_RELATIVE_PATH, TILE_RESERVE_THRESHOLD } from '@app/constants/classes-constants';
import {
    AMOUNT_MUST_BE_GREATER_THAN_1,
    MUST_HAVE_7_TILES_TO_SWAP,
    NOT_ENOUGH_TILES,
    TILE_NOT_IN_RESERVE,
    TILE_RESERVE_MUST_BE_INITIATED,
} from '@app/constants/classes-errors';
import { BLANK_TILE_LETTER_VALUE, LETTER_VALUES } from '@app/constants/game';
import { promises } from 'fs';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { join } from 'path';
import { LetterDistributionData, TileData } from './tile.types';

export default class TileReserve {
    private tiles: Tile[];
    private initialized: boolean;

    constructor() {
        this.tiles = [];
        this.initialized = false;
    }

    static async fetchLetterDistribution(): Promise<TileData[]> {
        const filePath = join(__dirname, LETTER_DISTRIBUTION_RELATIVE_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const data: LetterDistributionData = JSON.parse(dataBuffer);
        return data.tiles;
    }

    async init(): Promise<void> {
        const letterDistribution = await TileReserve.fetchLetterDistribution();
        letterDistribution.forEach((tile) => {
            for (let i = 0; i < tile.amount; ++i) {
                this.tiles.push({ letter: tile.letter as LetterValue, value: tile.score, isBlank: tile.letter === BLANK_TILE_LETTER_VALUE });
            }
        });
        this.initialized = true;
    }

    getTiles(amount: number): Tile[] {
        if (!this.initialized) throw new Error(TILE_RESERVE_MUST_BE_INITIATED);
        if (amount < 1) throw new Error(AMOUNT_MUST_BE_GREATER_THAN_1);
        const tilesToReturn: Tile[] = [];
        const tileToGive = Math.min(this.tiles.length, amount);
        for (let i = 0; i < tileToGive; ++i) {
            const tile = this.tiles[Math.floor(Math.random() * this.tiles.length)];
            tilesToReturn.push(tile);
            this.removeTile(tile);
        }
        return tilesToReturn;
    }

    swapTiles(tilesToSwap: Tile[]): Tile[] {
        if (!this.initialized) throw new Error(TILE_RESERVE_MUST_BE_INITIATED);
        if (this.tiles.length < tilesToSwap.length) throw new Error(NOT_ENOUGH_TILES);
        if (this.tiles.length < TILE_RESERVE_THRESHOLD) throw new Error(MUST_HAVE_7_TILES_TO_SWAP);

        const tilesToReturn: Tile[] = this.getTiles(tilesToSwap.length);
        this.tiles = this.tiles.concat(tilesToSwap);

        return tilesToReturn;
    }

    getTilesLeftPerLetter(): Map<LetterValue, number> {
        if (!this.initialized) throw new Error(TILE_RESERVE_MUST_BE_INITIATED);
        const map = new Map<LetterValue, number>();

        LETTER_VALUES.forEach((letter) => {
            map.set(letter, this.tiles.filter((t) => t.letter === letter).length);
        });

        return map;
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    private removeTile(tile: Tile): void {
        const index = this.tiles.indexOf(tile);
        if (index < 0) throw new Error(TILE_NOT_IN_RESERVE);
        this.tiles.splice(index, 1);
    }
}
