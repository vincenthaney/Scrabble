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

// import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
// import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
// import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';

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

// class UniqueTileArraySet extends Set {
//     constructor(array) {
//         super(array);

//         const names = [];
//         for (let value of this) {
//             if (names.includes(value.name)) {
//                 this.delete(value);
//             } else {
//                 names.push(value.name);
//             }
//         }
//     }
// }

@Service()
export default class WordFindingService {
    // constructor(
    //     private wordExtraction: WordExtraction,
    //     private wordVerification: WordsVerificationService,
    //     private scoreCalculator: ScoreCalculatorService,
    // ) {}

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
        // eslint-disable-next-line no-unused-vars
        // const emptySquares = board.getTileSquares((square: Square) => square.tile !== null);
        // const emptySquares = board.getDesiredSquares((square: Square) => square.tile !== null);

        // let anchorSquare = this.getRandomSquare(emptySquares);

        // const rowMap; // {0: tried = false, 1: tried = true,...}
        // const columnMap;
        // const pivotSquare = pivotSquares[Math.floor(Math.random() * pivotSquares.length)];

        // let anchorSquare = this.getRandomSquare(placedSquares);
        // let anchorRow = {...board.grid[anchorSquare.position.row]};
        // let anchorWord = [];

        // let navigator: BoardNavigator = new BoardNavigator(board, anchorSquare.position);
        // while (navigator.move(Orientation.Horizontal, Direction.Forward).verify(HAS_TILE)) {
        //     // We know that square has a tile because it was checked in the while condition
        //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //     anchorWord.push([navigator.square, navigator.square.tile!]);
        // }

        // navigator.

        // navigator.clone()
        // for (board.)

        throw new Error('not implemented');
    }
    getRandomSquare(squares: Square[]): Square {
        return squares.splice(Math.floor(Math.random() * squares.length), 1)[0];
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
    // subsetsOfString(str: string, result: string[], curr: string = '', index: number = 0): void {
    //     if (index === str.length) {
    //         result.push(curr);
    //         return;
    //     }
    //     this.subsetsOfString(str, result, curr, index + 1);
    //     this.subsetsOfString(str, result, curr + str[index], index + 1);
    // }

    subsetsOfTiles(str: Tile[], result: Tile[][], curr: Tile[] = [], index: number = 0): void {
        if (index === str.length) {
            result.push(curr);
            return;
        }
        this.subsetsOfTiles(str, result, curr, index + 1);
        this.subsetsOfTiles(str, result, curr.concat(str[index]), index + 1);
    }

    getAllSubTiles(tiles: Tile[]): Tile[][] {
        let i;
        let j;
        const result: Tile[][] = [];
        for (i = 0; i < tiles.length; i++) {
            for (j = i + 1; j < tiles.length + 1; j++) {
                result.push(tiles.slice(i, j));
            }
        }
        return result;
    }

    // buildSubstrings(str: string = '') {
    //     let i, j;
    //     const res = [];
    //     for (i = 0; i < str.length; i++) {
    //         for (j = i + 1; j < str.length + 1; j++) {
    //             res.push(str.slice(i, j));
    //         }
    //     }
    //     return res;
    // }

    // permute(s: string, result: string[], answer: string = '') {
    //     if (s.length === 0) {
    //         result.push(answer);
    //         return;
    //     }

    //     for (let i = 0; i < s.length; i++) {
    //         const ch = s[i];
    //         const leftSubstr = s.slice(0, i);
    //         const rightSubstr = s.slice(i + 1);
    //         const rest = leftSubstr + rightSubstr;
    //         this.permute(rest, result, answer + ch);
    //     }
    // }

    permut(tiles: string): Set<string> {
        if (tiles.length < 2) return new Set<string>(tiles);

        const permutations: Set<string> = new Set<string>();

        for (let i = 0; i < tiles.length; i++) {
            const char = tiles[i];

            // skip duplicates
            if (tiles.indexOf(char) !== i) continue;

            const remainingString = tiles.slice(0, i) + tiles.slice(i + 1, tiles.length);

            for (const subPermutation of this.permut(remainingString)) {
                permutations.add(char + subPermutation);
                // if (permutations.has(subPermutation)) continue;
                permutations.add(subPermutation);
            }
        }
        return permutations;
    }

    permutations(tiles: Tile[]): Set<Tile[]> {
        if (tiles.length < 2) return new Set<Tile[]>([tiles]);

        // if (tiles.length < 2) {
        //     const set = new Set<Tile[]>();
        //     set.add(tiles);
        //     return set;
        // }

        const permutations: Set<Tile[]> = new Set<Tile[]>();

        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];

            // skip duplicates
            if (tiles.indexOf(tile) !== i) continue;

            const remainingString = tiles.slice(0, i).concat(tiles.slice(i + 1, tiles.length));

            for (const subPermutation of this.permutations(remainingString)) {
                // const newPermutation = subPermutation;
                // newPermutation.unshift(tile);
                // permutations.add(newPermutation);
                permutations.add([tile].concat(subPermutation));
                // if (permutations.has(subPermutation)) continue;
                permutations.add(subPermutation);
            }
        }
        return permutations;
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
            result.concat(this.combination(permutation));
        }
        return result;
    }

    // getRackPermutations(tiles: Tile[], currentTiles: Tile[], index: number, length: number, result: Tile[][]): Tile[][] {
    //     // const result: Tile[][] = [];
    //     if (index === currentTiles.length) {
    //         result.push(currentTiles);
    //         return result;
    //     }
    //     result.concat(this.getRackPermutations(tiles, currentTiles, index + 1, length, result));
    //     result.concat(this.getRackPermutations(tiles, currentTiles.concat(tiles[index]), index + 1, length, result));

    //     return result;
    // }

    // findPermutations(tiles: Tile[]): Tile[][] {
    //     if (tiles.length < 2) {
    //         return [tiles];
    //     }

    //     const permutationsArray = [];

    //     for (let i = 0; i < tiles.length; i++) {
    //         const tile = tiles[i];

    //         if (tiles.indexOf(tile) !== i) continue;

    //         const remainingChars = tiles.slice(0, i).concat(tiles.slice(i + 1, tiles.length));

    //         for (const permutation of this.findPermutations(remainingChars)) {
    //             permutationsArray.push([tile].concat(permutation));
    //         }
    //     }
    //     return permutationsArray;
    // }
}
