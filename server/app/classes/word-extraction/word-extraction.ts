import { Board, Square, Orientation, Position } from '@app/classes/board';
import { LetterValue, Tile } from '@app/classes/tile';

export class WordExtraction {
    verifyTileSquare(board: Board, position: Position): boolean {
        const positionInBoard =
            position.row >= 0 && position.col >= 0 && position.row <= board.grid.length - 1 && position.col <= board.grid[0].length - 1;
        return positionInBoard && board.grid[position.row][position.col].tile ? true : false;
    }

    extract(board: Board, tilesToPlace: Tile[], startPosition: Position, orientation: Orientation): LetterValue[][] {
        if (!this.verifyTileSquare(board, startPosition)) return [[]];
        let extractedWord;
        let actualPosition: Position = { row: startPosition.row, col: startPosition.col };
        const wordsCreated: LetterValue[][] = new Array();
        for (const tile of tilesToPlace) {
            if (orientation === Orientation.Horizontal) {
                // There is a tile up or down of the played Square
                if (
                    this.verifyTileSquare(board, { row: actualPosition.row + 1, col: actualPosition.col }) ||
                    this.verifyTileSquare(board, { row: actualPosition.row - 1, col: actualPosition.col })
                ) {
                    extractedWord = this.extractVerticalWord(board, board.grid[actualPosition.row][actualPosition.col], tile);
                    if (extractedWord.length > 0) wordsCreated.push(extractedWord);
                }
                actualPosition.col++;
            }
            if (orientation === Orientation.Vertical) {
                // There is a tile up or down of the played letter
                if (
                    this.verifyTileSquare(board, { row: actualPosition.row, col: actualPosition.col + 1 }) ||
                    this.verifyTileSquare(board, { row: actualPosition.row, col: actualPosition.col - 1 })
                ) {
                    extractedWord = this.extractHorizontalWord(board, actualPosition, tile);
                    if (extractedWord.length > 0) wordsCreated.push(extractedWord);
                }
                actualPosition.row++;
            }
        }
        if (orientation === Orientation.Horizontal) {
            extractedWord = this.extractHorizontalWord(board, squaresPlaced[0]);
            if (extractedWord.length > 0) wordsCreated.push(extractedWord);
        } else {
            extractedWord = this.extractVerticalWord(board, squaresPlaced[0]);
            if (extractedWord.length > 0) wordsCreated.push(extractedWord);
        }
        return wordsCreated;
    }

    private extractVerticalWord(board: Board, tilePosition: Position, addedTile: Tile): LetterValue[] {
        if (this.verifyTileSquare(board, tilePosition)) return [];
        const squarePlaced = board.grid[tilePosition.row][tilePosition.col];
        const newWord = new Array(addedTile.letter);

        // go up until you find first empty square or the edge of the board
        let higherSquare = board.grid[squarePlaced.row - 1][squarePlaced.column];
        // add >= 0 ??
        while (higherSquare.tile && higherSquare.column > 0) {
            // COL ici???
            newWord.unshift(higherSquare.tile.letter);
            higherSquare = board.grid[higherSquare.row - 1][higherSquare.column];
        }
        if (higherSquare.row > 0 && higherSquare.tile) {
            newWord.unshift(higherSquare.tile.letter);
        }
        // go down until you find first empty square or the edge of the board
        let lowerSquare = board.grid[squarePlaced.row + 1][squarePlaced.column];
        while (lowerSquare.tile && lowerSquare.column < board.grid.length - 1) {
            // COLICI?
            newWord.push(lowerSquare.tile.letter);
            lowerSquare = board.grid[lowerSquare.row + 1][lowerSquare.column];
        }
        if (lowerSquare.row === board.grid.length - 1 && lowerSquare.tile !== undefined) {
            newWord.push(lowerSquare.tile.letter);
        }
        return newWord;
    }

    private extractHorizontalWord(board: Board, squarePlaced: Square): LetterValue[] {
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

// import { Board, Square, Orientation } from '@app/classes/board';
// import { LetterValue } from '@app/classes/tile';

// export class WordExtraction {
//     extract(board: Board, squaresPlaced: Square[], orientation: Orientation): LetterValue[][] {
//         // for (const squarePlaced of squaresPlaced) {

//         // }

//         const wordsCreated: LetterValue[][] = new Array();
//         for (const squarePlaced of squaresPlaced) {
//             if (!squarePlaced.tile) return [[]];
//             if (orientation === Orientation.Horizontal) {
//                 // There is a letter up or down of the played letter
//                 if (
//                     (squarePlaced.row > 0 && board.grid[squarePlaced.row - 1][squarePlaced.column].tile) ||
//                     (squarePlaced.row < board.grid.length - 1 && board.grid[squarePlaced.row + 1][squarePlaced.column].tile)
//                 ) {
//                     wordsCreated.push(this.extractVerticalWord(board, squarePlaced));
//                 }
//             }
//             if (orientation === Orientation.Vertical) {
//                 // There is a letter up or down of the played letter
//                 if (
//                     (squarePlaced.column > 0 && board.grid[squarePlaced.row][squarePlaced.column - 1].tile) ||
//                     (squarePlaced.column < board.grid[0].length - 1 && board.grid[squarePlaced.row][squarePlaced.column + 1].tile)
//                 ) {
//                     wordsCreated.push(this.extractHorizontalWord(board, squarePlaced));
//                 }
//             }
//         }
//         if (orientation === Orientation.Horizontal) {
//             wordsCreated.push(this.extractHorizontalWord(board, squaresPlaced[0]));
//         } else {
//             wordsCreated.push(this.extractVerticalWord(board, squaresPlaced[0]));
//         }
//         return wordsCreated;
//     }

//     private extractVerticalWord(board: Board, squarePlaced: Square): LetterValue[] {
//         let newWord;
//         if (!squarePlaced.tile) return [];
//         else {
//             newWord = new Array(squarePlaced.tile.letter);
//         }

//         // go up until you find first empty square or the edge of the board
//         let higherSquare = board.grid[squarePlaced.row - 1][squarePlaced.column];
//         while (higherSquare.tile && higherSquare.column > 0) {
//             newWord.unshift(higherSquare.tile.letter);
//             higherSquare = board.grid[higherSquare.row - 1][higherSquare.column];
//         }
//         if (higherSquare.row > 0 && higherSquare.tile) {
//             newWord.unshift(higherSquare.tile.letter);
//         }
//         // go down until you find first empty square or the edge of the board
//         let lowerSquare = board.grid[squarePlaced.row + 1][squarePlaced.column];
//         while (lowerSquare.tile && lowerSquare.column < board.grid.length - 1) {
//             newWord.push(lowerSquare.tile.letter);
//             lowerSquare = board.grid[lowerSquare.row + 1][lowerSquare.column];
//         }
//         if (lowerSquare.row === board.grid.length - 1 && lowerSquare.tile !== undefined) {
//             newWord.push(lowerSquare.tile.letter);
//         }
//         return newWord;
//     }

//     private extractHorizontalWord(board: Board, squarePlaced: Square): LetterValue[] {
//         let newWord;
//         if (!squarePlaced.tile) return [];
//         else {
//             newWord = new Array(squarePlaced.tile.letter);
//         }

//         // go left until you find first empty square or the edge of the board
//         let leftSquare = board.grid[squarePlaced.row][squarePlaced.column - 1];
//         while (leftSquare.tile && leftSquare.column > 0) {
//             newWord.unshift(leftSquare.tile.letter);
//             leftSquare = board.grid[leftSquare.row][leftSquare.column - 1];
//         }
//         if (leftSquare.row > 0 && leftSquare.tile) {
//             newWord.unshift(leftSquare.tile.letter);
//         }
//         // go right until you find first empty square or the edge of the board
//         let rightSquare = board.grid[squarePlaced.row][squarePlaced.column + 1];
//         while (rightSquare.tile && rightSquare.column < board.grid[0].length - 1) {
//             newWord.push(rightSquare.tile.letter);
//             rightSquare = board.grid[rightSquare.row + 1][rightSquare.column];
//         }
//         if (rightSquare.column === board.grid[0].length - 1 && rightSquare.tile !== undefined) {
//             newWord.push(rightSquare.tile.letter);
//         }
//         return newWord;
//     }
// }
