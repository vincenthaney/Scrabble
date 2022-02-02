import { Board, Orientation, Position } from '@app/classes/board';
import { LetterValue, Tile } from '@app/classes/tile';
import { EXTRACTION_SQUARE_ALREADY_FILLED, EXTRACTION_POSITION_OUT_OF_BOARD, EXTRACTION_TILES_INVALID } from './word-extraction-errors';

const SHOULD_HAVE_A_TILE = true;
const SHOULD_HAVE_NO_TILE = false;

export class WordExtraction {
    verifySquare(board: Board, position: Position, shouldBeFilled: boolean): boolean {
        if (position.row >= 0 && position.col >= 0 && position.row <= board.grid.length - 1 && position.col <= board.grid[0].length - 1) {
            return board.grid[position.row][position.col].tile ? shouldBeFilled : !shouldBeFilled;
        } else {
            throw new Error(EXTRACTION_POSITION_OUT_OF_BOARD);
        }
    }
    // verifySquareEmpty(board: Board, position: Position): boolean {
    //     const positionInBoard =
    //         position.row >= 0 && position.col >= 0 && position.row <= board.grid.length - 1 && position.col <= board.grid[0].length - 1;
    //     return positionInBoard && board.grid[position.row][position.col].tile ? false : true;
    // }

    // eslint-disable-next-line complexity

    extract(board: Board, tilesToPlace: Tile[], startPosition: Position, orientation: Orientation): LetterValue[][] {
        if (!this.verifySquare(board, startPosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        if (tilesToPlace.length < 1 || tilesToPlace.length > board.grid.length) throw new Error(EXTRACTION_TILES_INVALID);
        const actualPosition: Position = { row: startPosition.row, col: startPosition.col };
        const beforePosition: Position = { row: startPosition.row, col: startPosition.col };

        const wordsCreated: LetterValue[][] = new Array();
        const newWord: LetterValue[] = new Array();

        let i = 0;
        while (i < tilesToPlace.length) {
            if (this.verifySquare(board, { row: actualPosition.row, col: actualPosition.col }, SHOULD_HAVE_A_TILE)) {
                const foundTile = board.grid[actualPosition.row][actualPosition.col].tile;
                if (foundTile) newWord.push(foundTile.letter);
                if (orientation === Orientation.Horizontal) actualPosition.col++;
                else actualPosition.row++;
                continue;
            }

            if (orientation === Orientation.Horizontal) {
                // There is a tile up or down of the actual Position
                if (
                    this.verifySquare(board, { row: actualPosition.row + 1, col: actualPosition.col }, SHOULD_HAVE_A_TILE) ||
                    this.verifySquare(board, { row: actualPosition.row - 1, col: actualPosition.col }, SHOULD_HAVE_A_TILE)
                ) {
                    wordsCreated.push(this.extractVerticalWord(board, actualPosition, tilesToPlace[i]));
                }
                actualPosition.col++;
            }
            if (orientation === Orientation.Vertical) {
                // There is a tile up or down of the actual Position
                if (
                    this.verifySquare(board, { row: actualPosition.row, col: actualPosition.col + 1 }, SHOULD_HAVE_A_TILE) ||
                    this.verifySquare(board, { row: actualPosition.row, col: actualPosition.col - 1 }, SHOULD_HAVE_A_TILE)
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
            actualPosition.col--;
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

        // if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        // const squarePlaced = board.grid[tilePosition.row][tilePosition.col];
        // const newWord = new Array(addedTile.letter);

        // // go up until you find first empty square or the edge of the board
        // let higherSquare = squarePlaced;
        // if (tilePosition.row > 0) higherSquare = board.grid[squarePlaced.row - 1][squarePlaced.column];
        // while (higherSquare.tile && higherSquare.row > 0) {
        //     newWord.unshift(higherSquare.tile.letter);
        //     higherSquare = board.grid[higherSquare.row - 1][higherSquare.column];
        // }
        // if (higherSquare.row === 0 && higherSquare.tile) {
        //     newWord.unshift(higherSquare.tile.letter);
        // }

        // // go down until you find first empty square or the edge of the board
        // let lowerSquare = squarePlaced;
        // if (tilePosition.row < board.grid.length - 1) lowerSquare = board.grid[squarePlaced.row + 1][squarePlaced.column];
        // while (lowerSquare.tile && lowerSquare.row < board.grid.length - 1) {
        //     newWord.push(lowerSquare.tile.letter);
        //     lowerSquare = board.grid[lowerSquare.row + 1][lowerSquare.column];
        // }
        // if (lowerSquare.row === board.grid.length - 1 && lowerSquare.tile) {
        //     newWord.push(lowerSquare.tile.letter);
        // }

        // return newWord;
    }

    private extractDownWord(board: Board, tilePosition: Position): LetterValue[] {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.col];
        const newWord = new Array();
        // go down until you find first empty square or the edge of the board
        let lowerSquare = squarePlaced;
        if (tilePosition.row < board.grid.length - 1) lowerSquare = board.grid[squarePlaced.row + 1][squarePlaced.column];
        while (lowerSquare.tile && lowerSquare.row < board.grid.length - 1) {
            newWord.push(lowerSquare.tile.letter);
            lowerSquare = board.grid[lowerSquare.row + 1][lowerSquare.column];
        }
        if (lowerSquare.row === board.grid.length - 1 && lowerSquare.tile) {
            newWord.push(lowerSquare.tile.letter);
        }

        return newWord;
    }

    private extractUpWord(board: Board, tilePosition: Position): LetterValue[] {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.col];
        const newWord = new Array();

        // go up until you find first empty square or the edge of the board
        let higherSquare = squarePlaced;
        if (tilePosition.row > 0) higherSquare = board.grid[squarePlaced.row - 1][squarePlaced.column];
        while (higherSquare.tile && higherSquare.row > 0) {
            newWord.unshift(higherSquare.tile.letter);
            higherSquare = board.grid[higherSquare.row - 1][higherSquare.column];
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
    // let leftSquare = squarePlaced;
    // if (tilePosition.col > 0) leftSquare = board.grid[squarePlaced.row][squarePlaced.column - 1];
    // while (leftSquare.tile && leftSquare.column > 0) {
    //     newWord.unshift(leftSquare.tile.letter);
    //     leftSquare = board.grid[leftSquare.row][leftSquare.column - 1];
    // }
    // if (leftSquare.column === 0 && leftSquare.tile) {
    //     newWord.unshift(leftSquare.tile.letter);
    // }

    // // go right until you find first empty square or the edge of the board
    // let rightSquare = squarePlaced;
    // if (tilePosition.col < board.grid[0].length - 1) rightSquare = board.grid[squarePlaced.row][squarePlaced.column + 1];
    // while (rightSquare.tile && rightSquare.column < board.grid.length - 1) {
    //     newWord.push(rightSquare.tile.letter);
    //     rightSquare = board.grid[rightSquare.row][rightSquare.column + 1];
    // }
    // if (rightSquare.column === board.grid.length - 1 && rightSquare.tile) {
    //     newWord.push(rightSquare.tile.letter);
    // }
    // return newWord;
    // }

    private extractLeftWord(board: Board, tilePosition: Position): LetterValue[] {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.col];
        const leftWord = new Array();

        // go left until you find first empty square or the edge of the board
        let leftSquare = squarePlaced;
        if (tilePosition.col > 0) leftSquare = board.grid[squarePlaced.row][squarePlaced.column - 1];
        while (leftSquare.tile && leftSquare.column > 0) {
            leftWord.unshift(leftSquare.tile.letter);
            leftSquare = board.grid[leftSquare.row][leftSquare.column - 1];
        }
        if (leftSquare.column === 0 && leftSquare.tile) {
            leftWord.unshift(leftSquare.tile.letter);
        }
        return leftWord;
    }

    private extractRightWord(board: Board, tilePosition: Position): LetterValue[] {
        if (!this.verifySquare(board, tilePosition, SHOULD_HAVE_NO_TILE)) throw new Error(EXTRACTION_SQUARE_ALREADY_FILLED);
        const squarePlaced = board.grid[tilePosition.row][tilePosition.col];
        const rightWord = new Array();

        // go right until you find first empty square or the edge of the board
        let rightSquare = squarePlaced;
        if (tilePosition.col < board.grid[0].length - 1) rightSquare = board.grid[squarePlaced.row][squarePlaced.column + 1];
        while (rightSquare.tile && rightSquare.column < board.grid.length - 1) {
            rightWord.push(rightSquare.tile.letter);
            rightSquare = board.grid[rightSquare.row][rightSquare.column + 1];
        }
        if (rightSquare.column === board.grid.length - 1 && rightSquare.tile) {
            rightWord.push(rightSquare.tile.letter);
        }
        return rightWord;
    }
}
// private extractHorizontalWord(board: Board, tilePosition: Position, addedTile: Tile): LetterValue[] {
//     if (this.verifySquareFilled(board, tilePosition)) return [];
//     const squarePlaced = board.grid[tilePosition.row][tilePosition.col];
//     const newWord = new Array(addedTile.letter);

//     // go up until you find first empty square or the edge of the board
//     let higherSquare = squarePlaced;
//     if (tilePosition.col > 0) higherSquare = board.grid[squarePlaced.row - 1][squarePlaced.column];
//     while (higherSquare.tile && higherSquare.row > 0) {
//         newWord.unshift(higherSquare.tile.letter);
//         higherSquare = board.grid[higherSquare.row - 1][higherSquare.column];
//     }
//     if (higherSquare.row === 0 && higherSquare.tile) {
//         newWord.unshift(higherSquare.tile.letter);
//     }

//     // go down until you find first empty square or the edge of the board
//     let lowerSquare = squarePlaced;
//     if (tilePosition.row > 0) lowerSquare = board.grid[squarePlaced.row + 1][squarePlaced.column];
//     while (lowerSquare.tile && lowerSquare.row < board.grid.length - 1) {
//         newWord.push(lowerSquare.tile.letter);
//         lowerSquare = board.grid[lowerSquare.row + 1][lowerSquare.column];
//     }
//     if (lowerSquare.row === board.grid.length - 1 && lowerSquare.tile) {
//         newWord.push(lowerSquare.tile.letter);
//     }

//     return newWord;
// }

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
