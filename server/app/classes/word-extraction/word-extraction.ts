import { Board, Square, Orientation } from '@app/classes/board';
import { LetterValue } from '@app/classes/tile';

export class WordExtraction {
    extract(board: Board, squaresPlaced: Square[], orientation: Orientation): LetterValue[][] {
        // const STARTING_SQUARE_ROW = 8;
        // const STARTING_SQUARE_COLUMN = 8;
        // for (const squarePlaced of squaresPlaced) {

        // }

        const wordsCreated: LetterValue[][] = new Array();
        for (const squarePlaced of squaresPlaced) {
            if (!squarePlaced.tile) return [[]];
            // if (squarePlaced.column === STARTING_SQUARE_ROW && squarePlaced.row === STARTING_SQUARE_COLUMN) {
            // }
            if (orientation === Orientation.Horizontal) {
                // There is a letter up or down of the played letter
                if (
                    (squarePlaced.row > 0 && board.grid[squarePlaced.row - 1][squarePlaced.column].tile) ||
                    (squarePlaced.row < board.grid.length - 1 && board.grid[squarePlaced.row + 1][squarePlaced.column].tile)
                ) {
                    wordsCreated.push(this.extractVerticalWord(board, squarePlaced));
                }
            }
            if (orientation === Orientation.Vertical) {
                // There is a letter up or down of the played letter
                if (
                    (squarePlaced.column > 0 && board.grid[squarePlaced.row][squarePlaced.column - 1].tile) ||
                    (squarePlaced.column < board.grid[0].length - 1 && board.grid[squarePlaced.row][squarePlaced.column + 1].tile)
                ) {
                    wordsCreated.push(this.extractHorizontalWord(board, squarePlaced));
                }
            }
        }
        if (orientation === Orientation.Horizontal) {
            wordsCreated.push(this.extractHorizontalWord(board, squaresPlaced[0]));
        } else {
            wordsCreated.push(this.extractVerticalWord(board, squaresPlaced[0]));
        }
        return wordsCreated;
    }

    extractVerticalWord(board: Board, squarePlaced: Square): LetterValue[] {
        let newWord;
        if (!squarePlaced.tile) return [];
        else {
            newWord = new Array(squarePlaced.tile.letter);
        }

        // go up until you find first empty square or the edge of the board
        let higherSquare = board.grid[squarePlaced.row - 1][squarePlaced.column];
        while (higherSquare.tile && higherSquare.column > 0) {
            newWord.unshift(higherSquare.tile.letter);
            higherSquare = board.grid[higherSquare.row - 1][higherSquare.column];
        }
        if (higherSquare.row > 0 && higherSquare.tile) {
            newWord.unshift(higherSquare.tile.letter);
        }
        // go down until you find first empty square or the edge of the board
        let lowerSquare = board.grid[squarePlaced.row + 1][squarePlaced.column];
        while (lowerSquare.tile && lowerSquare.column < board.grid.length - 1) {
            newWord.push(lowerSquare.tile.letter);
            lowerSquare = board.grid[lowerSquare.row + 1][lowerSquare.column];
        }
        if (lowerSquare.row === board.grid.length - 1 && lowerSquare.tile !== undefined) {
            newWord.push(lowerSquare.tile.letter);
        }
        return newWord;
    }

    extractHorizontalWord(board: Board, squarePlaced: Square): LetterValue[] {
        let newWord;
        if (!squarePlaced.tile) return [];
        else {
            newWord = new Array(squarePlaced.tile.letter);
        }

        // go left until you find first empty square or the edge of the board
        let leftSquare = board.grid[squarePlaced.row][squarePlaced.column - 1];
        while (leftSquare.tile && leftSquare.column > 0) {
            newWord.unshift(leftSquare.tile.letter);
            leftSquare = board.grid[leftSquare.row][leftSquare.column - 1];
        }
        if (leftSquare.row > 0 && leftSquare.tile) {
            newWord.unshift(leftSquare.tile.letter);
        }
        // go right until you find first empty square or the edge of the board
        let rightSquare = board.grid[squarePlaced.row][squarePlaced.column + 1];
        while (rightSquare.tile && rightSquare.column < board.grid[0].length - 1) {
            newWord.push(rightSquare.tile.letter);
            rightSquare = board.grid[rightSquare.row + 1][rightSquare.column];
        }
        if (rightSquare.column === board.grid[0].length - 1 && rightSquare.tile !== undefined) {
            newWord.push(rightSquare.tile.letter);
        }
        return newWord;
    }
}
