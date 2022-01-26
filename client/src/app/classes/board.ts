import { BOARD_SIZE } from '@app/classes/game-constants';
import { Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';

export class Board {
    static readonly size: Vec2 = { x: BOARD_SIZE.x, y: BOARD_SIZE.y };
    grid: Square[][];

    static fillBoardGrid(): Square[][] {
        const grid: Square[][] = [];
        for (let i = 0; i < Board.size.y; i++) {
            grid[i] = [];
            for (let j = 0; j < Board.size.x; j++) {
                grid[i][j] = {
                    tile: null,
                    letterMultiplier: 1,
                    wordMultiplier: 1,
                    isMultiplierPlayed: false, // TODO: find better name
                };
            }
        }
        // console.log(grid);
        return grid;
    }
    // placeTile(position: Position, tile: Tile): boolean {
    //     throw new Error('Method not implemented.');
    // } // Verify if there is already a tile in that square
    removePlayedTiles(): void {
        throw new Error('Method not implemented.');
    }
}
