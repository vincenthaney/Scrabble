import { Tile } from '@app/classes/tile';

export class TileReserve {
    tiles: Tile[];

    getTiles(amount: number): Tile[] {
        throw new Error('Method not implemented.');
    }

    swapTiles(tiles: Tile[]): Tile[] {
        throw new Error('Method not implemented.');
    }

    getTilesLeft(): number {
        throw new Error('Method not implemented.');
    }

    getTilesLeftPerLetter(): Map<string, number> {
        throw new Error('Method not implemented.');
    }
}
