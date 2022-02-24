/* eslint-disable max-lines */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
import { Board, Orientation } from '@app/classes/board';
import BoardNavigator from '@app/classes/board/board-navigator';
import Direction from '@app/classes/board/direction';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { WordFindingRequest, WordPlacement } from '@app/classes/word-finding';
import { Service } from 'typedi';
import { SHOULD_HAVE_A_TILE as HAS_TILE } from '@app/classes/board/board';

import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { DICTIONARY_NAME } from '@app/constants/services-constants/words-verification.service.const';
import { StringConversion } from '@app/utils/string-conversion';
// import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';

export interface MovePossibilities {
    isTried: boolean;
    minimumLength: number;
    maximumLength: number;
}
export interface SquareProperties {
    square: Square;
    horizontal: MovePossibilities;
    vertical: MovePossibilities;
    isEmpty: boolean;
}
const INITIAL_TILE = 1;

@Service()
export default class WordFindingService {
    constructor(
        private wordExtraction: WordExtraction,
        private wordVerification: WordsVerificationService, // private scoreCalculator: ScoreCalculatorService,
    ) {}

    findProperties(navigator: BoardNavigator, tileRackSize: number): MovePossibilities {
        const movePossibilities = { isTried: false, minimumLength: Number.POSITIVE_INFINITY, maximumLength: Number.POSITIVE_INFINITY };

        movePossibilities.minimumLength = this.findMinimumWordLength(navigator);

        if (movePossibilities.minimumLength > tileRackSize) {
            movePossibilities.isTried = true;
            return movePossibilities;
        }
        movePossibilities.maximumLength =
            tileRackSize - this.findMaximumWordTileLeftLength(navigator, tileRackSize - movePossibilities.minimumLength);

        return movePossibilities;
    }

    findMinimumWordLength(navigator: BoardNavigator): number {
        return INITIAL_TILE + navigator.moveUntil(Direction.Forward, () => navigator.verifyAllNeighbors(HAS_TILE));
    }

    findMaximumWordTileLeftLength(navigator: BoardNavigator, tilesLeftSize: number): number {
        navigator.moveUntil(Direction.Forward, () => {
            if (navigator.isEmpty()) tilesLeftSize--;
            return tilesLeftSize === 0;
        });
        return tilesLeftSize;
    }

    findSquareProperties(board: Board, square: Square, tileRackSize: number): SquareProperties {
        const navigator: BoardNavigator = new BoardNavigator(board, square.position, Orientation.Horizontal);
        return {
            square,
            horizontal: this.findProperties(navigator.clone(), tileRackSize),
            vertical: this.findProperties(navigator.clone().switchOrientation(), tileRackSize),
            isEmpty: navigator.isEmpty(),
        };
    }

    // const minimumLength = 1 + navigator.moveUntil(Orientation.Horizontal, Direction.Forward, () => navigator.verifyAllNeighbors(HAS_TILE));
    // let length = minimumLength;
    // const maximumLength = navigator.moveUntil(Orientation.Horizontal, Direction.Forward, () => {
    //     length++;
    //     return !navigator.isWithinBounds() || length < 7});

    // while (navigator.move(Orientation.Horizontal, Direction.Forward).verify(HAS_NO_TILE)) {

    //     // We know that square has a tile because it was checked in the while condition
    //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //     anchorPlacement.push([endNavigator.square, endNavigator.square.tile!]);
    //     anchorWord+=(endNavigator.square.tile!.letter);
    // }

    // const squaresProperties: SquareProperties[][] = [];
    // for (const row of board.grid) {
    //     const rowProperties: SquareProperties[] = [];
    //     for (const square of row) {
    //         rowProperties.push({square, horizontal:{isTried: false, minimumLength: Number.MIN_VALUE, maximumLength: Number.MAX_VALUE},
    // vertical:{isTried: false, minimumLength: Number.MIN_VALUE, maximumLength: Number.MAX_VALUE}, isEmpty: !square.tile})
    //     }
    //     squaresProperties.push(rowProperties);
    // }

    // eslint-disable-next-line no-unused-vars
    findWords(board: Board, tiles: Tile[], query: WordFindingRequest): WordPlacement[] {
        const rackPermutation = this.getRackPermutations(tiles);
        const emptySquares = board.getDesiredSquares((square: Square) => square.tile !== null);
        const validMoves: WordPlacement[] = [];

        while (emptySquares.length > 0) {
            const emptySquare = this.getRandomSquare(emptySquares);
            const squareProperties = this.findSquareProperties(board, emptySquare, tiles.length);

            for (const permutation of rackPermutation) {
                let result = this.attemptMove(squareProperties, permutation, Orientation.Horizontal);
                if (result) validMoves.push(result);
                result = this.attemptMove(squareProperties, permutation, Orientation.Vertical);
                if (result) validMoves.push(result);
            }
        }
        return validMoves;
    }

    attemptMove(squareProperties: SquareProperties, permutation: Tile[], orientation: Orientation): WordPlacement | undefined {
        const movePossibilities = this.getCorrespondingMovePossibility(squareProperties, orientation);
        if (movePossibilities.isTried && this.isWithin(movePossibilities, permutation.length)) {
            try {
                const createdWords = this.wordExtraction.extract(permutation, squareProperties.square.position, orientation);
                this.wordVerification.verifyWords(StringConversion.wordToString(createdWords), DICTIONARY_NAME);
                return { tilesToPlace: permutation, orientation, startPosition: squareProperties.square.position };
                // eslint-disable-next-line no-empty
            } catch (exception) {}
        }
        return undefined;
    }

    getRandomSquare(squares: Square[]): Square {
        return squares.splice(Math.floor(Math.random() * squares.length), 1)[0];
    }

    getCorrespondingMovePossibility(squareProperties: SquareProperties, orientation: Orientation): MovePossibilities {
        return orientation === Orientation.Horizontal ? squareProperties.horizontal : squareProperties.vertical;
    }

    isWithin(movePossibility: MovePossibilities, target: number): boolean {
        return movePossibility.minimumLength <= target && target <= movePossibility.maximumLength;
    }

    combination(arr: Tile[]) {
        const res: Tile[][] = [[]];
        let temp;
        // Try every combination of either including or excluding each Tile of the array
        // eslint-disable-next-line no-bitwise
        const maxCombinations = 1 << arr.length;
        for (let i = 0; i < maxCombinations; ++i) {
            temp = [];
            for (let j = 0; j < arr.length; ++j) {
                // If the tile has to be included in the current combination
                // eslint-disable-next-line no-bitwise
                if (i & (1 << j)) {
                    temp.push(arr[j]);
                }
            }
            res.push(temp);
        }
        return res.filter((l) => l.length > 0);
    }

    permuteTiles(tiles: Tile[], result: Tile[][], current: Tile[] = []) {
        if (tiles.length === 0) {
            result.push(current);
            return;
        }

        for (let i = 0; i < tiles.length; i++) {
            const ch = tiles[i];
            const leftSubstr = tiles.slice(0, i);
            const rightSubstr = tiles.slice(i + 1);
            const rest = leftSubstr.concat(rightSubstr);
            this.permuteTiles(rest, result, current.concat(ch));
        }
    }

    getRackPermutations(tiles: Tile[]): Tile[][] {
        const result: Tile[][] = [];
        const tileRackPermutations: Tile[][] = this.combination(tiles);
        for (const permutation of tileRackPermutations) {
            this.permuteTiles(permutation, result);
        }
        return result;
    }
    // generateWords(row: Square[], rackPermutations: string[], navigator: BoardNavigator): WordPlacement[] {
    //     let anchorPlacement = [];
    //     let anchorWord = '';
    //     let endNavigator = navigator.clone();
    //     while (endNavigator.move(Orientation.Horizontal, Direction.Forward).verify(HAS_TILE)) {
    //         // We know that square has a tile because it was checked in the while condition
    //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //         anchorPlacement.push([endNavigator.square, endNavigator.square.tile!]);
    //         anchorWord+=(endNavigator.square.tile!.letter);
    //     }
    //     while (navigator.move(Orientation.Horizontal, Direction.Backward).verify(HAS_TILE)) {
    //         // We know that square has a tile because it was checked in the while condition
    //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //         anchorPlacement.unshift([navigator.square, navigator.square.tile!]);
    //         anchorWord=(endNavigator.square.tile!.letter) + anchorWord;
    //     }
    //     let currentWord = anchorWord;
    //     currentWord+=tiles[0].letter;
    //     try
    //     this.wordVerification.verifyWords([currentWord], 'dict');

    // }

    // tryPossibleWords(row: Square[], rackPermutations: string[]) {
    //     const anchorWords: [string, number][] = [];
    //     let currentWord = '';
    //     for (let i = row.length - 1; i >= 0; i--) {
    //         if (row[i].tile) {
    //             currentWord += row[i].tile?.letter;
    //         } else if (currentWord !== '') {
    //             anchorWords.push([currentWord, i]);
    //             currentWord = '';
    //         }
    //     }
    //     if (anchorWords.length === 0) return;
    // }

    // for (const letter of lettersToPlace) {
    //         if (playerTiles[i].letter.toLowerCase() === letter) {
    //             tilesToPlace.push(playerTiles.splice(i, 1)[0]);
    //             break;
    //         } else if (playerTiles[i].letter === '*' && (letter as LetterValue) && letter === letter.toUpperCase()) {
    //             const tile = playerTiles.splice(i, 1)[0];
    //             tilesToPlace.push(new Tile(letter as LetterValue, tile.value, true));
    //             break;
    //         }
    //     }
    // }

    // findPermutations(word: string): string[] {
    //     if (word.length < 2) {
    //         return [word];
    //     }

    //     const permutationsArray = [];

    //     for (let i = 0; i < word.length; i++) {
    //         const char = word[i];

    //         if (word.indexOf(char) !== i) continue;

    //         const remainingChars = word.slice(0, i) + word.slice(i + 1, word.length);

    //         for (const permutation of this.findPermutations(remainingChars)) {
    //             permutationsArray.push(char + permutation);
    //         }
    //     }
    //     return permutationsArray;
    // }

    // findPlacements(row: Square[], maxNewLetters: number): string[] {
    //     // |****A*BON*ES***|
    //     const possiblePlacements: string[] = [];
    //     for (const square of row) {
    //         if (!square.tile) {
    //             this.findPlacements(row.slice(0, i).concat(row.slice(i + 1, row.length));)
    //         }
    //     }

    // }
}
