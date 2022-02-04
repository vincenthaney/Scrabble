import { Orientation, Position } from './';
import { Tile } from '@app/classes/tile';
import Square from './square';
import { POSITION_OUT_OF_BOARD } from './board-errors';

export const SHOULD_HAVE_A_TILE = true;
export const SHOULD_HAVE_NO_TILE = false;
export default class Board {
    grid: Square[][];

    /* eslint-disable @typescript-eslint/no-magic-numbers */
    // TODO: Change to correct
    constructor() {
        this.grid = [];
        for (let i = 0; i < 15; i++) {
            this.grid[i] = [];
            for (let j = 0; j < 15; j++) {
                const square = {
                    tile: undefined,
                    multiplier: 1,
                    multiplierType: undefined,
                    played: false,
                    row: i,
                    column: j,
                };
                this.grid[i][j] = square;
            }
        }
    }

    placeTile(tile: Tile, position: Position): boolean {
        if (position.row < 0 || position.row >= this.grid.length || position.column < 0 || position.column >= this.grid[0].length) return false;
        const targetSquare = this.grid[position.row][position.column];
        if (targetSquare.tile) return false;
        targetSquare.tile = tile;
        return true;
    }

    placeWord(tiles: Tile[], startPosition: Position, orientation: Orientation): boolean {
        const actualPosition = { ...startPosition };
        if (tiles.length === 0 || this.grid[startPosition.row][startPosition.column].tile) return false;
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

    // Verifies if the position is valid and if the square at the given position in the board has a tile or not
    verifySquare(position: Position, shouldBeFilled: boolean): boolean {
        if (position.row >= 0 && position.column >= 0 && position.row <= this.grid.length - 1 && position.column <= this.grid[0].length - 1) {
            return this.grid[position.row][position.column].tile ? shouldBeFilled : !shouldBeFilled;
        } else {
            throw new Error(POSITION_OUT_OF_BOARD);
        }
    }
}
