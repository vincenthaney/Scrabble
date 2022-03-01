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
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { Random } from '@app/utils/random';

export interface MovePossibilities {
    isTried: boolean;
    minimumLength: number;
    maximumLength: number;
}

export interface EvaluatedPlacement extends WordPlacement {
    score: number;
}
export interface SquareProperties {
    square: Square;
    horizontal: MovePossibilities;
    vertical: MovePossibilities;
    isEmpty: boolean;
}
const INITIAL_TILE = 1;
// const QUICK_MOVE_TIME = 3000;
const LONG_MOVE_TIME = 20000;

@Service()
export default class WordFindingService {
    private wordExtraction: WordExtraction;
    constructor(private wordVerification: WordsVerificationService, private scoreCalculator: ScoreCalculatorService) {}

    // eslint-disable-next-line no-unused-vars
    findWords(board: Board, tiles: Tile[], query: WordFindingRequest): EvaluatedPlacement[] {
        const validMoves: EvaluatedPlacement[] = [];
        let isOver = false;

        // setTimeout(() => {
        //     if (validMoves.length > query.numberOfWordsToFind) {
        //         isOver = true;
        //     } else {
        //         setTimeout(() => {
        //             isOver = true;
        //         }, LONG_MOVE_TIME - QUICK_MOVE_TIME);
        //     }
        // }, QUICK_MOVE_TIME);

        setTimeout(() => {
            isOver = true;
        }, LONG_MOVE_TIME);

        this.wordExtraction = new WordExtraction(board);
        const rackPermutation = this.getRackPermutations(tiles);
        const emptySquares = board.getDesiredSquares((square: Square) => square.tile !== null);

        while (emptySquares.length > 0 && !isOver) {
            const emptySquare = this.getRandomSquare(emptySquares);
            const squareProperties = this.findSquareProperties(board, emptySquare, tiles.length);

            for (const permutation of rackPermutation) {
                this.attemptMove(squareProperties, permutation, validMoves);
            }
        }
        // cleartimeout??
        return this.chooseMove(validMoves, query);
    }

    // Hint if I find only 2 moves and we want 3, what to do
    // If we find no possible moves, what to do?
    // What do we want Hint to return? best moves? random moves?
    chooseMove(validMoves: EvaluatedPlacement[], query: WordFindingRequest): EvaluatedPlacement[] {
        if (validMoves.length <= query.numberOfWordsToFind) {
            return validMoves;
        } else if (query.maximiseScore) {
            return validMoves.sort((previous, current) => previous.score - current.score).slice(0, query.numberOfWordsToFind);
        } else if (!query.pointRange || !query.pointHistoric) {
            return Random.getRandomElementsFromArray(validMoves, query.numberOfWordsToFind);
        }

        // Get the lowest frequency score move from available moves
        const foundMoves = new Map<number, EvaluatedPlacement>();
        for (const move of validMoves) {
            if (query.pointRange.minimum <= move.score && move.score <= query.pointRange.maximum && !foundMoves.has(move.score)) {
                foundMoves.set(move.score, move);
            }
        }
        let lowestFrequency = Number.POSITIVE_INFINITY;
        for (const move of foundMoves) {
            const frequency = query.pointHistoric.get(move[0]);
            if (frequency && frequency < lowestFrequency) lowestFrequency = frequency;
        }
        return [foundMoves[lowestFrequency]];
    }

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

    attemptMove(squareProperties: SquareProperties, permutation: Tile[], validMoves: EvaluatedPlacement[]): void {
        let result = this.attemptMoveDirection(squareProperties, permutation, Orientation.Horizontal);
        if (result) validMoves.push(result);
        result = this.attemptMoveDirection(squareProperties, permutation, Orientation.Vertical);
        if (result) validMoves.push(result);
    }

    attemptMoveDirection(squareProperties: SquareProperties, permutation: Tile[], orientation: Orientation): EvaluatedPlacement | undefined {
        const movePossibilities = this.getCorrespondingMovePossibility(squareProperties, orientation);
        if (!movePossibilities.isTried && this.isWithin(movePossibilities, permutation.length)) {
            try {
                const createdWords = this.wordExtraction.extract(permutation, squareProperties.square.position, orientation);
                this.wordVerification.verifyWords(StringConversion.wordToString(createdWords), DICTIONARY_NAME);
                return {
                    tilesToPlace: permutation,
                    orientation,
                    startPosition: squareProperties.square.position,
                    score: this.scoreCalculator.calculatePoints(createdWords) + this.scoreCalculator.bonusPoints(permutation),
                };
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

    permuteTiles(tiles: Tile[], result: Tile[][], current: Tile[] = []): void {
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
}
