import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { promises } from 'fs';
import { join } from 'path';
import { LetterValue, Tile } from '@app/classes/tile';
import * as TileError from './tiles.errors';
import * as TileConst from './tile.const';
import { LETTER_VALUES } from '@app/constants/game';
import { LetterDistributionData, TileData } from './tile.types';

export default class TileReserve {
    private tiles: Tile[];
    private referenceTiles: Tile[];
    private initialized: boolean;

    constructor() {
        this.tiles = [];
        this.referenceTiles = [];
        this.initialized = false;
    }

    static async fetchLetterDistribution(): Promise<TileData[]> {
        const filePath = join(__dirname, TileConst.LETTER_DISTRIBUTION_RELATIVE_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const data: LetterDistributionData = JSON.parse(dataBuffer);
        return data.tiles;
    }

    async init(): Promise<void> {
        const letterDistribution = await TileReserve.fetchLetterDistribution();
        letterDistribution.forEach((tile) => {
            for (let i = 0; i < tile.amount; ++i) {
                this.tiles.push({ letter: tile.letter as LetterValue, value: tile.score });
            }
        });
        this.referenceTiles = [...this.tiles];
        this.initialized = true;
    }

    getTiles(amount: number): Tile[] {
        if (!this.initialized) throw new Error(TileError.TILE_RESERVE_MUST_BE_INITIATED);
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
        if (!this.initialized) throw new Error(TileError.TILE_RESERVE_MUST_BE_INITIATED);
        if (this.tiles.length < tilesToSwap.length) throw new Error(TileError.NOT_ENOUGH_TILES);
        if (this.tiles.length < TileConst.TILE_RESERVE_THRESHOLD) throw new Error(TileError.MUST_HAVE_7_TILES_TO_SWAP);
        if (tilesToSwap.some((tile) => !this.referenceTiles.includes(tile))) throw new Error(TileError.MUST_SWAP_WITH_TILES_ORIGINALLY_FROM_RESERVE);

        const tilesToReturn: Tile[] = this.getTiles(tilesToSwap.length);
        this.tiles = this.tiles.concat(tilesToSwap);

        return tilesToReturn;
    }

    getTilesLeft(): number {
        if (!this.initialized) throw new Error(TileError.TILE_RESERVE_MUST_BE_INITIATED);
        return this.tiles.length;
    }

    getTilesLeftPerLetter(): Map<LetterValue, number> {
        if (!this.initialized) throw new Error(TileError.TILE_RESERVE_MUST_BE_INITIATED);
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
        if (index < 0) throw new Error(TileError.TILE_NOT_IN_RESERVE);
        this.tiles.splice(index, 1);
    }
}
