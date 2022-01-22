import { Tile } from '@app/classes/tile';

export class TileReserve {
    tiles: Tile[];

    getTiles(amount: number): Tile[] {
        return new Array(0);
    }

    swapTiles(tiles: Tile[]): Tile[] {
        return tiles;
    }

    getTilesLeft(): number {
        return 0;
    }

    getTilesLeftPerLetter(): Map<string, number> {
        return new Map<string, number>();
    }
}
