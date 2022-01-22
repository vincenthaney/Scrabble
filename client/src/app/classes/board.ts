import { Tile } from '@app/classes/tile';
import { Square } from '@app/classes/square';
import { Position } from '@app/classes/position';

export class Board {
    grid: Square[][];
    placeTile(position: Position, tile: Tile): boolean {
        return false;
    } // Verify if there is already a tile in that square
    removePlayedTiles(): void {
        return;
    }
}
