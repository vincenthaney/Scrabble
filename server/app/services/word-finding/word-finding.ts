/* eslint-disable no-console */
/* eslint-disable complexity */
import { Board, Orientation } from '@app/classes/board';
import BoardNavigator from '@app/classes/board/board-navigator';
import Direction from '@app/classes/board/direction';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { EvaluationInfo, MovePossibilities, SearchState, SquareProperties, WordFindingRequest, WordFindingUsage } from '@app/classes/word-finding';
import { Service } from 'typedi';
import { SHOULD_HAVE_A_TILE as HAS_TILE } from '@app/classes/board/board';

import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { DICTIONARY_NAME } from '@app/constants/services-constants/words-verification.service.const';
import { StringConversion } from '@app/utils/string-conversion';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { Random } from '@app/utils/random';
import { INVALID_REQUEST_POINT_RANGE, NO_REQUEST_POINT_HISTORIC, NO_REQUEST_POINT_RANGE } from '@app/constants/services-errors';
import { HINT_AMOUNT_OF_WORDS, INITIAL_TILE, LONG_MOVE_TIME, QUICK_MOVE_TIME } from '@app/constants/services-constants/word-finding.const';
import { EvaluatedPlacement } from '@app/classes/word-finding/word-placement';

// Not currently considering wildcards
// Not currently ignoring repeating tiles



@Service()
export default class WordFindingService {
    private wordExtraction: WordExtraction;
    constructor(private wordVerification: WordsVerificationService, private scoreCalculator: ScoreCalculatorService) {}

    findWords(board: Board, tiles: Tile[], request: WordFindingRequest): EvaluatedPlacement[] {
        const startTime = new Date();
        let previousTime = new Date();
        let currentTime;
        let timeState = SearchState.Selective;
        this.wordExtraction = new WordExtraction(board);
        let chosenMoves: EvaluatedPlacement[] | undefined;
        const validMoves: EvaluatedPlacement[] = [];
        const rejectedValidMoves: [number, EvaluatedPlacement][] = [];
        let pointDistributionChance = new Map();
        if (request.usage === WordFindingUsage.Beginner) pointDistributionChance = this.distributeChance(request);

        const rackPermutation = this.getRackPermutations(tiles);
        const emptySquares = board.getDesiredSquares((square: Square) => square.tile === null);

        while (emptySquares.length > 0 && timeState !== SearchState.Over) {
            const emptySquare = this.getRandomSquare(emptySquares);
            const squareProperties = this.findSquareProperties(board, emptySquare, tiles.length);
            const foundMoves: EvaluatedPlacement[] = [];

            for (const permutation of rackPermutation) {
                this.attemptMove(squareProperties, permutation, foundMoves);
            }
            currentTime = new Date();
            console.log(
                // eslint-disable-next-line max-len
                `timeOver: ${timeState} Total time: ${currentTime.getTime() - startTime.getTime()} | Time Elapsed: ${
                    currentTime.getTime() - previousTime.getTime()
                } | Squares left ${emptySquares.length}`,
            );
            previousTime = currentTime;
            timeState = this.updateState(currentTime.getTime() - startTime.getTime());
            chosenMoves = this.evaluate(timeState, request, { foundMoves, validMoves, rejectedValidMoves, pointDistributionChance });
            if (chosenMoves) return chosenMoves;
        }
        currentTime = new Date();
        console.log(`Total time: ${currentTime.getTime() - startTime.getTime()} `);
        console.log(validMoves.length);

        chosenMoves = this.evaluate(timeState, request, { foundMoves: [], validMoves, rejectedValidMoves, pointDistributionChance });
        return chosenMoves ? chosenMoves : [];
    }

    evaluate(timeState: SearchState, request: WordFindingRequest, evalutionInfo: EvaluationInfo): EvaluatedPlacement[] | undefined {
        if (request.usage === WordFindingUsage.Beginner) {
            const movesInRange = this.getMovesInRange(evalutionInfo.foundMoves, request);
            for (const movesScore of movesInRange.values()) {
                for (const move of movesScore) {
                    if (timeState === SearchState.Selective && this.acceptMove(move, evalutionInfo.pointDistributionChance)) {
                        return [move];
                    } else {
                        evalutionInfo.rejectedValidMoves.push([evalutionInfo.pointDistributionChance[move.score], move]);
                    }
                }
            }
            if (timeState !== SearchState.Selective && evalutionInfo.rejectedValidMoves.length > 0)
                return [evalutionInfo.rejectedValidMoves.sort((previous, current) => current[0] - previous[0]).slice(0, 1)[0][1]];
        } else if (request.usage === WordFindingUsage.Hint) {
            evalutionInfo.validMoves.concat(evalutionInfo.foundMoves);
            if (evalutionInfo.validMoves.length > HINT_AMOUNT_OF_WORDS) {
                return Random.getRandomElementsFromArray(evalutionInfo.validMoves, HINT_AMOUNT_OF_WORDS);
            }
        } else {
            evalutionInfo.validMoves.concat(evalutionInfo.foundMoves);
            if (timeState === SearchState.Over) {
                return evalutionInfo.validMoves.sort((previous, current) => current.score - previous.score).slice(0, 1);
            }
        }
        return undefined;
    }

    updateState(timeElapsed: number): SearchState {
        if (timeElapsed > LONG_MOVE_TIME) {
            return SearchState.Over;
        } else if (timeElapsed > QUICK_MOVE_TIME) {
            return SearchState.Unselective;
        } else {
            return SearchState.Selective;
        }
    }

    acceptMove(move: EvaluatedPlacement, pointDistributionChance: Map<number, number>): boolean {
        const chance = pointDistributionChance.get(move.score);
        return chance ? chance > Math.random() : true;
    }

    distributeChance(request: WordFindingRequest): Map<number, number> {
        if (!request.pointRange) throw new Error(NO_REQUEST_POINT_RANGE);
        if (!request.pointHistoric) throw new Error(NO_REQUEST_POINT_HISTORIC);
        if (request.pointRange.minimum > request.pointRange.maximum) throw new Error(INVALID_REQUEST_POINT_RANGE);

        const [minFrequency, maxFrequency] = this.findMinMaxRangeFrequency(request);
        const frequencyDifference = maxFrequency - minFrequency;
        const scoreChanceDistribution = new Map<number, number>();

        for (let score = request.pointRange.minimum; score < request.pointRange.maximum + 1; score++) {
            const scoreFrequency = request.pointHistoric.get(score);
            if (scoreFrequency) {
                scoreChanceDistribution.set(score, 1 / (frequencyDifference + 1));
            } else {
                scoreChanceDistribution.set(score, 1);
            }
        }
        return scoreChanceDistribution;
    }

    findMinMaxRangeFrequency(request: WordFindingRequest): [number, number] {
        if (!request.pointRange) throw new Error(NO_REQUEST_POINT_RANGE);
        if (!request.pointHistoric) throw new Error(NO_REQUEST_POINT_HISTORIC);
        if (request.pointRange.minimum > request.pointRange.maximum) throw new Error(INVALID_REQUEST_POINT_RANGE);

        let maxFrequency = 0;
        let minFrequency = Number.MAX_VALUE;
        for (let score = request.pointRange.minimum; score < request.pointRange.maximum + 1; score++) {
            const scoreFrequency = request.pointHistoric.get(score);
            if (scoreFrequency) {
                if (scoreFrequency < minFrequency) minFrequency = scoreFrequency;
                if (scoreFrequency > maxFrequency) maxFrequency = scoreFrequency;
            }
        }
        return [minFrequency, maxFrequency];
    }

    // chooseMove(validMoves: EvaluatedPlacement[], request: WordFindingRequest): EvaluatedPlacement[] {
    //     if (request.usage === WordFindingUsage.Expert) {
    //         return validMoves.sort((previous, current) => current.score - previous.score).slice(0, 1);
    //     } else if (request.usage === WordFindingUsage.Hint) {
    //         return Random.getRandomElementsFromArray(validMoves, HINT_AMOUNT_OF_WORDS);
    //     } else {
    //         // return [this.selectLowestFrequencyScoreMove(this.getMovesInRange(validMoves, request), request)];
    //         return validMoves;
    //     }
    // }

    getMovesInRange(validMoves: EvaluatedPlacement[], request: WordFindingRequest): Map<number, EvaluatedPlacement[]> {
        if (!request.pointRange) throw new Error(NO_REQUEST_POINT_RANGE);
        const foundMoves = new Map<number, EvaluatedPlacement[]>();
        for (const move of validMoves) {
            if (request.pointRange.minimum <= move.score && move.score <= request.pointRange.maximum) {
                if (foundMoves.has(move.score)) {
                    foundMoves.get(move.score)?.push(move);
                } else {
                    foundMoves.set(move.score, [move]);
                }
            }
        }
        return foundMoves;
    }

    // selectLowestFrequencyScoreMove(foundMovesMap: Map<number, EvaluatedPlacement>, request: WordFindingRequest): EvaluatedPlacement {
    //     if (!request.pointHistoric) throw new Error(NO_REQUEST_POINT_HISTORIC);

    //     let lowestFrequency = Number.POSITIVE_INFINITY;
    //     let [selectedMove] = foundMovesMap.values();
    //     for (const move of foundMovesMap) {
    //         const frequency = request.pointHistoric.get(move[0]);
    //         if (!frequency) {
    //             lowestFrequency = 0;
    //             selectedMove = move[1];
    //             break;
    //         } else if (frequency < lowestFrequency) {
    //             lowestFrequency = frequency;
    //             selectedMove = move[1];
    //         }
    //     }
    //     return selectedMove;
    // }

    findProperties(navigator: BoardNavigator, tileRackSize: number): MovePossibilities {
        const movePossibilities = { isTried: false, minimumLength: Number.POSITIVE_INFINITY, maximumLength: Number.POSITIVE_INFINITY };

        movePossibilities.minimumLength = this.findMinimumWordLength(navigator);

        if (movePossibilities.minimumLength > tileRackSize) {
            movePossibilities.isTried = true; // isvalid?
            return movePossibilities;
        }
        movePossibilities.maximumLength =
            tileRackSize - this.findMaximumWordTileLeftLength(navigator, tileRackSize - movePossibilities.minimumLength);

        return movePossibilities;
    }

    findMinimumWordLength(navigator: BoardNavigator): number {
        return INITIAL_TILE + navigator.moveUntil(Direction.Forward, () => navigator.verifyAllNeighbors(HAS_TILE) || navigator.square.isCenter);
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
            isEmpty: navigator.isEmpty(), // useless
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
