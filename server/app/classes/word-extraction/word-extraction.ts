import { Board, Orientation, Position } from '@app/classes/board';
import { LetterValue, Tile } from '@app/classes/tile';
import { EXTRACTION_SQUARE_ALREADY_FILLED, EXTRACTION_POSITION_OUT_OF_BOARD, EXTRACTION_TILES_INVALID } from './word-extraction-errors';

const SHOULD_HAVE_A_TILE = true;
const SHOULD_HAVE_NO_TILE = false;

export class WordExtraction {
    verifySquare(board: Board, position: Position, shouldBeFilled: boolean): boolean {
        if (position.row >= 0 && position.column >= 0 && position.row <= board.grid.length - 1 && position.column <= board.grid[0].length - 1) {
            return board.grid[position.row][position.column].tile ? shouldBeFilled : !shouldBeFilled;
        } else {
            throw new Error(EXTRACTION_POSITION_OUT_OF_BOARD);
        }
    }

    extract(board: Board, tilesToPlace: Tile[], startPosition: Position, orientation: Orientation): LetterValue[][] {
        if (!this.verifySquare(board, startPosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        if (tilesToPlace.length < 1 || tilesToPlace.length > board.grid.length) throw new Error(EXTRACTION_TILES_INVALID);
        const actualPosition: Position = { row: startPosition.row, column: startPosition.column };
        const beforePosition: Position = { row: startPosition.row, column: startPosition.column };

        const wordsCreated: LetterValue[][] = new Array();
        const newWord: LetterValue[] = new Array();

        let i = 0;
        while (i < tilesToPlace.length) {
            if (this.verifySquare(board, { row: actualPosition.row, column: actualPosition.column }, SHOULD_HAVE_A_TILE)) {
                const foundTile = board.grid[actualPosition.row][actualPosition.column].tile;
                if (foundTile) newWord.push(foundTile.letter);
                if (orientation === Orientation.Horizontal) actualPosition.column++;
                else actualPosition.row++;
                continue;
            }

            if (orientation === Orientation.Horizontal) {
                // There is a tile up or down of the actual Position
                if (
                    this.verifySquare(board, { row: actualPosition.row + 1, column: actualPosition.column }, SHOULD_HAVE_A_TILE) ||
                    this.verifySquare(board, { row: actualPosition.row - 1, column: actualPosition.column }, SHOULD_HAVE_A_TILE)
                ) {
                    wordsCreated.push(this.extractVerticalWord(board, actualPosition, tilesToPlace[i]));
                }
                actualPosition.column++;
            }
            if (orientation === Orientation.Vertical) {
                // There is a tile up or down of the actual Position
                if (
                    this.verifySquare(board, { row: actualPosition.row, column: actualPosition.column + 1 }, SHOULD_HAVE_A_TILE) ||
                    this.verifySquare(board, { row: actualPosition.row, column: actualPosition.column - 1 }, SHOULD_HAVE_A_TILE)
                ) {
                    wordsCreated.push(this.extractHorizontalWord(board, actualPosition, tilesToPlace[i]));
                }
                actualPosition.row++;
            }
            newWord.push(tilesToPlace[i].letter);
            i++;
        }
        let beforeWord;
        let afterWord;
        if (orientation === Orientation.Horizontal) {
            actualPosition.column--;
            beforeWord = this.extractLeftWord(board, beforePosition);
            afterWord = this.extractRightWord(board, actualPosition);
        } else {
            actualPosition.row--;
            beforeWord = this.extractUpWord(board, beforePosition);
            afterWord = this.extractDownWord(board, actualPosition);
        }

        wordsCreated.push(beforeWord.concat(newWord).concat(afterWord));
        return wordsCreated;
    }

    private extractVerticalWord(board: Board, tilePosition: Position, addedTile: Tile): LetterValue[] {
        const newWord = new Array(addedTile.letter);
        const upWord = this.extractUpWord(board, tilePosition);
        const downWord = this.extractDownWord(board, tilePosition);
        return upWord.concat(newWord).concat(downWord);
    }

    private extractDownWord(board: Board, tilePosition: Position): LetterValue[] {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        const newWord = new Array();
        // go down until you find first empty square or the edge of the board
        let lowerSquare = squarePlaced;
        if (tilePosition.row < board.grid.length - 1) lowerSquare = board.grid[squarePlaced.row + 1][squarePlaced.columnumn];
        while (lowerSquare.tile && lowerSquare.row < board.grid.length - 1) {
            newWord.push(lowerSquare.tile.letter);
            lowerSquare = board.grid[lowerSquare.row + 1][lowerSquare.columnumn];
        }
        if (lowerSquare.row === board.grid.length - 1 && lowerSquare.tile) {
            newWord.push(lowerSquare.tile.letter);
        }

        return newWord;
    }

    private extractUpWord(board: Board, tilePosition: Position): LetterValue[] {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        const newWord = new Array();

        // go up until you find first empty square or the edge of the board
        let higherSquare = squarePlaced;
        if (tilePosition.row > 0) higherSquare = board.grid[squarePlaced.row - 1][squarePlaced.columnumn];
        while (higherSquare.tile && higherSquare.row > 0) {
            newWord.unshift(higherSquare.tile.letter);
            higherSquare = board.grid[higherSquare.row - 1][higherSquare.columnumn];
        }
        if (higherSquare.row === 0 && higherSquare.tile) {
            newWord.unshift(higherSquare.tile.letter);
        }
        return newWord;
    }
    private extractHorizontalWord(board: Board, tilePosition: Position, addedTile: Tile): LetterValue[] {
        const newWord = new Array(addedTile.letter);
        const leftWord = this.extractLeftWord(board, tilePosition);
        const rightWord = this.extractRightWord(board, tilePosition);
        return leftWord.concat(newWord).concat(rightWord);
    }

    private extractLeftWord(board: Board, tilePosition: Position): LetterValue[] {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        const leftWord = new Array();

        // go left until you find first empty square or the edge of the board
        let leftSquare = squarePlaced;
        if (tilePosition.column > 0) leftSquare = board.grid[squarePlaced.row][squarePlaced.columnumn - 1];
        while (leftSquare.tile && leftSquare.columnumn > 0) {
            leftWord.unshift(leftSquare.tile.letter);
            leftSquare = board.grid[leftSquare.row][leftSquare.columnumn - 1];
        }
        if (leftSquare.columnumn === 0 && leftSquare.tile) {
            leftWord.unshift(leftSquare.tile.letter);
        }
        return leftWord;
    }

    private extractRightWord(board: Board, tilePosition: Position): LetterValue[] {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.column];
        const rightWord = new Array();

        // go right until you find first empty square or the edge of the board
        let rightSquare = squarePlaced;
        if (tilePosition.column < board.grid[0].length - 1) rightSquare = board.grid[squarePlaced.row][squarePlaced.columnumn + 1];
        while (rightSquare.tile && rightSquare.columnumn < board.grid.length - 1) {
            rightWord.push(rightSquare.tile.letter);
            rightSquare = board.grid[rightSquare.row][rightSquare.columnumn + 1];
        }
        if (rightSquare.columnumn === board.grid.length - 1 && rightSquare.tile) {
            rightWord.push(rightSquare.tile.letter);
        }
        return rightWord;
    }
}
