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
            return tilesLeftSize > 1;
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
        board.getDesiredSquares((square: Square) => square.tile !== null);

        // let anchorSquare = this.getRandomSquare(placedSquares);

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

    // getRackPermutations(tiles: Tile[], currentWord: string, index: number, length: number): string[] {
    //     let result: string[] = [];
    //     if (length === currentWord.length) {
    //         result.push(currentWord);
    //         return result;
    //     }
    //     result.concat(this.getRackPermutations(tiles, currentWord, index + 1, length));
    //     result.concat(this.getRackPermutations(tiles, currentWord + tiles[index].letter, index + 1, length));
    //     return result;
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

    getRandomSquare(squares: Square[]): Square {
        return squares[Math.floor(Math.random() * squares.length) + 1];
    }

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

    findPermutations(tiles: Tile[]): Tile[][] {
        if (tiles.length < 2) {
            return [tiles];
        }

        const permutationsArray = [];

        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];

            if (tiles.indexOf(tile) !== i) continue;

            const remainingChars = tiles.slice(0, i).concat(tiles.slice(i + 1, tiles.length));

            for (const permutation of this.findPermutations(remainingChars)) {
                permutationsArray.push([tile].concat(permutation));
            }
        }
        return permutationsArray;
    }
}
