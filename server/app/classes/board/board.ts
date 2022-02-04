import { Orientation, Position } from './';
import { Tile } from '@app/classes/tile';
import { Square } from '@app/classes/square';
import { POSITION_OUT_OF_BOARD } from './board-errors';

export const SHOULD_HAVE_A_TILE = true;
export const SHOULD_HAVE_NO_TILE = false;
export default class Board {
    grid: Square[][];

    constructor(grid: Square[][]) {
        this.grid = grid;
    }
    // Verifies if the position is valid and if the square at the given position in the board has a tile or not
    verifySquare(position: Position, shouldBeFilled: boolean): boolean {
        if (position.row >= 0 && position.column >= 0 && position.row <= this.grid.length - 1 && position.column <= this.grid[0].length - 1) {
            return this.grid[position.row][position.column].tile ? shouldBeFilled : !shouldBeFilled;
        } else {
            throw new Error(POSITION_OUT_OF_BOARD);
        }
    }
    placeTile(tile: Tile, position: Position): boolean {
        if (!this.verifySquare(position, SHOULD_HAVE_NO_TILE)) return false;
        this.grid[position.row][position.column].tile = tile;
        return true;
    }

    placeWord(tiles: Tile[], startPosition: Position, orientation: Orientation): boolean {
        const actualPosition = { ...startPosition };
        if (tiles.length === 0 || !this.verifySquare(startPosition, SHOULD_HAVE_NO_TILE)) return false;
        const isVertical = orientation === Orientation.Vertical;
        const validatedTiles = new Map<Square, Tile>();
        let i = 0;
        while (i < tiles.length) {
            if (
                actualPosition.row < 0 ||
                actualPosition.row >= this.grid.length ||
                actualPosition.column < 0 ||
                actualPosition.column >= this.grid[0].length
            )
                return false;
            const targetSquare = this.grid[actualPosition.row][actualPosition.column];
            if (isVertical) actualPosition.row++;
            else actualPosition.column++;
            if (targetSquare.tile) {
                continue;
            } else {
                validatedTiles.set(targetSquare, tiles[i]);
                i++;
            }
        }
        for (const [square, tile] of validatedTiles) {
            square.tile = tile;
        }
        return true;
    }
}
