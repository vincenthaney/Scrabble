import { BOARD_SIZE } from '@app/classes/game-constants';
import { Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';

export class Board {
    static readonly size: Vec2 = { x: BOARD_SIZE.x, y: BOARD_SIZE.y };
    grid: Square[][];
    // placeTile(position: Position, tile: Tile): boolean {
    //     throw new Error('Method not implemented.');
    // } // Verify if there is already a tile in that square
    removePlayedTiles(): void {
        throw new Error('Method not implemented.');
    }
}
