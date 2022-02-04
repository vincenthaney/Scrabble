import { Board, Orientation, Position, Square } from '@app/classes/board';
import { SHOULD_HAVE_A_TILE, SHOULD_HAVE_NO_TILE } from '@app/classes/board/board';

import { Tile } from '@app/classes/tile';
import { EXTRACTION_SQUARE_ALREADY_FILLED, EXTRACTION_TILES_INVALID } from './word-extraction-errors';

export class WordExtraction {
    static extract(board: Board, tilesToPlace: Tile[], startPosition: Position, orientation: Orientation): [Square, Tile][][] {
        if (!board.verifySquare(startPosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        if (tilesToPlace.length < 1 || tilesToPlace.length > board.grid.length) throw new Error(EXTRACTION_TILES_INVALID);
        const wordsCreated: [Square, Tile][][] = new Array();
        const newWord: [Square, Tile][] = [];
        const actualPosition: Position = { ...startPosition };

        let i = 0;
        while (i < tilesToPlace.length) {
            // if there is a tile at actualPosition
            if (board.verifySquare({ row: actualPosition.row, column: actualPosition.column }, SHOULD_HAVE_A_TILE)) {
                // Add the occupied square and its tile to newWord and go to the next square in the appropriate direction
                const occupiedSquare = board.grid[actualPosition.row][actualPosition.column];
                if (occupiedSquare.tile) newWord.push([occupiedSquare, occupiedSquare.tile]);
                if (orientation === Orientation.Horizontal) actualPosition.column++;
                else actualPosition.row++;
                continue;
            }
            // else tileToPlace would be placed at actualPosition
            newWord.push([board.grid[actualPosition.row][actualPosition.column], tilesToPlace[i]]);

            // Add the words created in the opposite Orientation of the move
            if (orientation === Orientation.Horizontal) {
                // if there is a tile up or down of the actual Position
                if (
                    board.verifySquare({ row: actualPosition.row + 1, column: actualPosition.column }, SHOULD_HAVE_A_TILE) ||
                    board.verifySquare({ row: actualPosition.row - 1, column: actualPosition.column }, SHOULD_HAVE_A_TILE)
                ) {
                    wordsCreated.push(this.extractVerticalWord(board, actualPosition, tilesToPlace[i]));
                }
                actualPosition.column++;
            }
            if (orientation === Orientation.Vertical) {
                // if there is a tile up or down of the actual Position
                if (
                    board.verifySquare({ row: actualPosition.row, column: actualPosition.column + 1 }, SHOULD_HAVE_A_TILE) ||
                    board.verifySquare({ row: actualPosition.row, column: actualPosition.column - 1 }, SHOULD_HAVE_A_TILE)
                ) {
                    wordsCreated.push(this.extractHorizontalWord(board, actualPosition, tilesToPlace[i]));
                }
                actualPosition.row++;
            }
            i++;
        }
        // Add the word created in the same Orientation of the move
        let beforeWord;
        let afterWord;
        // actualPosition.row/column-- to go back 1 square to get the square of the last tileToPlace
        if (orientation === Orientation.Horizontal) {
            actualPosition.column--;
            beforeWord = this.extractLeftWord(board, startPosition);
            afterWord = this.extractRightWord(board, actualPosition);
        } else {
            actualPosition.row--;
            beforeWord = this.extractUpWord(board, startPosition);
            afterWord = this.extractDownWord(board, actualPosition);
        }

        wordsCreated.push(beforeWord.concat(newWord).concat(afterWord));
        return wordsCreated;
    }

    private static extractVerticalWord(board: Board, tilePosition: Position, addedTile: Tile): [Square, Tile][] {
        const upWord = this.extractUpWord(board, tilePosition);
        const downWord = this.extractDownWord(board, tilePosition);
        const newWord = [[board.grid[tilePosition.row][tilePosition.column], addedTile]] as [Square, Tile][];

        return upWord.concat(newWord).concat(downWord);
    }

    private static extractHorizontalWord(board: Board, tilePosition: Position, addedTile: Tile): [Square, Tile][] {
        const leftWord = this.extractLeftWord(board, tilePosition);
        const rightWord = this.extractRightWord(board, tilePosition);
        const newWord = [[board.grid[tilePosition.row][tilePosition.column], addedTile]] as [Square, Tile][];
        return leftWord.concat(newWord).concat(rightWord);
    }

    private static extractDownWord(board: Board, tilePosition: Position): [Square, Tile][] {
        if (!board.verifySquare(tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        const downWord: [Square, Tile][] = new Array<[Square, Tile]>();
        // go down until you find first empty square or the edge of the board
        let lowerSquare = squarePlaced;
        if (tilePosition.row < board.grid.length - 1) lowerSquare = board.grid[squarePlaced.row + 1][squarePlaced.column];
        while (lowerSquare.tile && lowerSquare.row < board.grid.length - 1) {
            downWord.push([lowerSquare, lowerSquare.tile]);
            lowerSquare = board.grid[lowerSquare.row + 1][lowerSquare.column];
        }

        if (lowerSquare.row === board.grid.length - 1 && lowerSquare.tile) {
            downWord.push([lowerSquare, lowerSquare.tile]);
        }

        return downWord;
    }

    private static extractUpWord(board: Board, tilePosition: Position): [Square, Tile][] {
        if (!board.verifySquare(tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        const upWord: [Square, Tile][] = [];

        // go up until you find first empty square or the edge of the board
        let higherSquare = squarePlaced;
        if (tilePosition.row > 0) higherSquare = board.grid[squarePlaced.row - 1][squarePlaced.column];
        while (higherSquare.tile && higherSquare.row > 0) {
            upWord.unshift([higherSquare, higherSquare.tile]);
            higherSquare = board.grid[higherSquare.row - 1][higherSquare.column];
        }
        if (higherSquare.row === 0 && higherSquare.tile) {
            upWord.unshift([higherSquare, higherSquare.tile]);
        }
        return upWord;
    }

    private static extractLeftWord(board: Board, tilePosition: Position): [Square, Tile][] {
        if (!board.verifySquare(tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        const leftWord: [Square, Tile][] = [];

        // go left until you find first empty square or the edge of the board
        let leftSquare = squarePlaced;
        if (tilePosition.column > 0) leftSquare = board.grid[squarePlaced.row][squarePlaced.column - 1];
        while (leftSquare.tile && leftSquare.column > 0) {
            leftWord.unshift([leftSquare, leftSquare.tile]);
            leftSquare = board.grid[leftSquare.row][leftSquare.column - 1];
        }
        if (leftSquare.column === 0 && leftSquare.tile) {
            leftWord.unshift([leftSquare, leftSquare.tile]);
        }
        return leftWord;
    }

    private static extractRightWord(board: Board, tilePosition: Position): [Square, Tile][] {
        if (!board.verifySquare(tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        const rightWord: [Square, Tile][] = [];

        // go right until you find first empty square or the edge of the board
        let rightSquare = squarePlaced;
        if (tilePosition.column < board.grid[0].length - 1) rightSquare = board.grid[squarePlaced.row][squarePlaced.column + 1];
        while (rightSquare.tile && rightSquare.column < board.grid.length - 1) {
            rightWord.push([rightSquare, rightSquare.tile]);
            rightSquare = board.grid[rightSquare.row][rightSquare.column + 1];
        }
        if (rightSquare.column === board.grid.length - 1 && rightSquare.tile) {
            rightWord.push([rightSquare, rightSquare.tile]);
        }
        return rightWord;
    }
}
