import { Board, Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { EXTRACTION_SQUARE_ALREADY_FILLED, EXTRACTION_POSITION_OUT_OF_BOARD, EXTRACTION_TILES_INVALID } from './word-extraction-errors';

const SHOULD_HAVE_A_TILE = true;
const SHOULD_HAVE_NO_TILE = false;

export class WordExtraction {
    // Verifies if the position is valid and if the square at the given position in the board has a tile or not
    verifySquare(board: Board, position: Position, shouldBeFilled: boolean): boolean {
        if (position.row >= 0 && position.column >= 0 && position.row <= board.grid.length - 1 && position.column <= board.grid[0].length - 1) {
            return board.grid[position.row][position.column].tile ? shouldBeFilled : !shouldBeFilled;
        } else {
            throw new Error(EXTRACTION_POSITION_OUT_OF_BOARD);
        }
    }

    extract(board: Board, tilesToPlace: Tile[], startPosition: Position, orientation: Orientation): string[] {
        if (!this.verifySquare(board, startPosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        if (tilesToPlace.length < 1 || tilesToPlace.length > board.grid.length) throw new Error(EXTRACTION_TILES_INVALID);
        const wordsCreated: string[] = new Array();
        let newWord = '';
        const actualPosition: Position = { row: startPosition.row, column: startPosition.column };
        const beforePosition: Position = { row: startPosition.row, column: startPosition.column };

        let i = 0;
        while (i < tilesToPlace.length) {
            // if there is a tile at actualPosition
            if (this.verifySquare(board, { row: actualPosition.row, column: actualPosition.column }, SHOULD_HAVE_A_TILE)) {
                // Add the tile.letter to newWord and go to the Square in appropriate direction
                const foundTile = board.grid[actualPosition.row][actualPosition.column].tile;
                if (foundTile) newWord += foundTile.letter;
                if (orientation === Orientation.Horizontal) actualPosition.column++;
                else actualPosition.row++;
                continue;
            }
            // Add the words created in the opposite Orientation of the move
            if (orientation === Orientation.Horizontal) {
                // if there is a tile up or down of the actual Position
                if (
                    this.verifySquare(board, { row: actualPosition.row + 1, column: actualPosition.column }, SHOULD_HAVE_A_TILE) ||
                    this.verifySquare(board, { row: actualPosition.row - 1, column: actualPosition.column }, SHOULD_HAVE_A_TILE)
                ) {
                    wordsCreated.push(this.extractVerticalWord(board, actualPosition, tilesToPlace[i]));
                }
                actualPosition.column++;
            }
            if (orientation === Orientation.Vertical) {
                // if there is a tile up or down of the actual Position
                if (
                    this.verifySquare(board, { row: actualPosition.row, column: actualPosition.column + 1 }, SHOULD_HAVE_A_TILE) ||
                    this.verifySquare(board, { row: actualPosition.row, column: actualPosition.column - 1 }, SHOULD_HAVE_A_TILE)
                ) {
                    wordsCreated.push(this.extractHorizontalWord(board, actualPosition, tilesToPlace[i]));
                }
                actualPosition.row++;
            }
            newWord += tilesToPlace[i].letter;
            i++;
        }
        // Add the move created in the same Orientation of the move
        let beforeWord;
        let afterWord;
        // actualPosition.row/column-- to go back 1 square to get the square of the last tile to place
        if (orientation === Orientation.Horizontal) {
            actualPosition.column--;
            beforeWord = this.extractLeftWord(board, beforePosition);
            afterWord = this.extractRightWord(board, actualPosition);
        } else {
            actualPosition.row--;
            beforeWord = this.extractUpWord(board, beforePosition);
            afterWord = this.extractDownWord(board, actualPosition);
        }

        wordsCreated.push(beforeWord + newWord + afterWord);
        return wordsCreated;
    }

    extractVerticalWord(board: Board, tilePosition: Position, addedTile: Tile): string {
        const newWord = addedTile.letter as string;
        const upWord = this.extractUpWord(board, tilePosition);
        const downWord = this.extractDownWord(board, tilePosition);
        return upWord + newWord + downWord;
    }

    extractHorizontalWord(board: Board, tilePosition: Position, addedTile: Tile): string {
        const newWord = addedTile.letter as string;
        const leftWord = this.extractLeftWord(board, tilePosition);
        const rightWord = this.extractRightWord(board, tilePosition);
        return leftWord + newWord + rightWord;
    }

    extractDownWord(board: Board, tilePosition: Position): string {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        let newWord = '';
        // go down until you find first empty square or the edge of the board
        let lowerSquare = squarePlaced;
        if (tilePosition.row < board.grid.length - 1) lowerSquare = board.grid[squarePlaced.row + 1][squarePlaced.column];
        while (lowerSquare.tile && lowerSquare.row < board.grid.length - 1) {
            newWord += lowerSquare.tile.letter;
            lowerSquare = board.grid[lowerSquare.row + 1][lowerSquare.column];
        }

        if (lowerSquare.row === board.grid.length - 1 && lowerSquare.tile) {
            newWord += lowerSquare.tile.letter;
        }

        return newWord;
    }

    extractUpWord(board: Board, tilePosition: Position): string {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        let newWord = '';

        // go up until you find first empty square or the edge of the board
        let higherSquare = squarePlaced;
        if (tilePosition.row > 0) higherSquare = board.grid[squarePlaced.row - 1][squarePlaced.column];
        while (higherSquare.tile && higherSquare.row > 0) {
            newWord = higherSquare.tile.letter + newWord;
            higherSquare = board.grid[higherSquare.row - 1][higherSquare.column];
        }
        if (higherSquare.row === 0 && higherSquare.tile) {
            newWord = higherSquare.tile.letter + newWord;
        }
        return newWord;
    }

    extractLeftWord(board: Board, tilePosition: Position): string {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        let leftWord = '';

        // go left until you find first empty square or the edge of the board
        let leftSquare = squarePlaced;
        if (tilePosition.column > 0) leftSquare = board.grid[squarePlaced.row][squarePlaced.column - 1];
        while (leftSquare.tile && leftSquare.column > 0) {
            leftWord = leftSquare.tile.letter + leftWord;
            leftSquare = board.grid[leftSquare.row][leftSquare.column - 1];
        }
        if (leftSquare.column === 0 && leftSquare.tile) {
            leftWord = leftSquare.tile.letter + leftWord;
        }
        return leftWord;
    }

    extractRightWord(board: Board, tilePosition: Position): string {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        let rightWord = '';

        // go right until you find first empty square or the edge of the board
        let rightSquare = squarePlaced;
        if (tilePosition.column < board.grid[0].length - 1) rightSquare = board.grid[squarePlaced.row][squarePlaced.column + 1];
        while (rightSquare.tile && rightSquare.column < board.grid.length - 1) {
            rightWord += rightSquare.tile.letter;
            rightSquare = board.grid[rightSquare.row][rightSquare.column + 1];
        }
        if (rightSquare.column === board.grid.length - 1 && rightSquare.tile) {
            rightWord += rightSquare.tile.letter;
        }
        return rightWord;
    }
}
