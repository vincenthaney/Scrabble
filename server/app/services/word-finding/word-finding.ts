import { Board, Orientation } from '@app/classes/board';
import BoardNavigator from '@app/classes/board/board-navigator';
import Direction from '@app/classes/board/direction';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import {
    EvaluationInfo,
    MovePossibilities,
    RejectedMove,
    SearchState,
    SquareProperties,
    WordFindingRequest,
    WordFindingUseCase,
} from '@app/classes/word-finding';
import { Service } from 'typedi';
import { SHOULD_HAVE_A_TILE as HAS_TILE } from '@app/classes/board/board';

import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { DICTIONARY_NAME } from '@app/constants/services-constants/words-verification.service.const';
import { StringConversion } from '@app/utils/string-conversion';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { Random } from '@app/utils/random';
import { INVALID_REQUEST_POINT_RANGE, NO_REQUEST_POINT_HISTORY, NO_REQUEST_POINT_RANGE } from '@app/constants/services-errors';
import { HINT_AMOUNT_OF_WORDS, INITIAL_TILE, LONG_MOVE_TIME, QUICK_MOVE_TIME } from '@app/constants/services-constants/word-finding.const';
import { EvaluatedPlacement } from '@app/classes/word-finding/word-placement';

// wildcards converted only to 'E'
// Not currently ignoring repeating tiles

@Service()
export default class WordFindingService {
    private wordExtraction: WordExtraction;
    constructor(private wordVerificationService: WordsVerificationService, private scoreCalculatorService: ScoreCalculatorService) {}

    findWords(board: Board, tiles: Tile[], request: WordFindingRequest): EvaluatedPlacement[] {
        const startTime = new Date();
        let searchState = SearchState.Selective;
        this.wordExtraction = new WordExtraction(board);
        let chosenMoves: EvaluatedPlacement[] | undefined;
        const validMoves: EvaluatedPlacement[] = [];
        const rejectedValidMoves: RejectedMove[] = [];
        let pointDistributionChance = new Map();
        if (request.useCase === WordFindingUseCase.Beginner) pointDistributionChance = this.distributeChance(request);

        const rackPermutations = this.getRackPermutations(tiles);
        const emptySquares = board.getDesiredSquares((square: Square) => square.tile === null);

        while (emptySquares.length > 0 && searchState !== SearchState.Over) {
            const squareProperties = this.findSquareProperties(board, this.getRandomSquare(emptySquares), tiles.length);
            const foundMoves: EvaluatedPlacement[] = [];
            this.attemptPermutations(rackPermutations, squareProperties, foundMoves);
            searchState = this.updateSearchState(startTime);
            chosenMoves = this.evaluate(searchState, request, { foundMoves, validMoves, rejectedValidMoves, pointDistributionChance });
            if (chosenMoves) return chosenMoves;
        }

        chosenMoves = this.evaluate(searchState, request, { foundMoves: [], validMoves, rejectedValidMoves, pointDistributionChance });
        return chosenMoves ? chosenMoves : [];
    }

    attemptPermutations(rackPermutations: Tile[][], squareProperties: SquareProperties, foundMoves: EvaluatedPlacement[]): void {
        for (const permutation of rackPermutations) {
            this.attemptMove(squareProperties, permutation, foundMoves);
        }
    }

    evaluate(searchState: SearchState, request: WordFindingRequest, evaluationInfo: EvaluationInfo): EvaluatedPlacement[] | undefined {
        if (request.useCase === WordFindingUseCase.Beginner) {
            return this.evaluateBeginner(searchState, request, evaluationInfo);
        } else if (request.useCase === WordFindingUseCase.Hint) {
            return this.evaluateHint(evaluationInfo);
        } else {
            return this.evaluateExpert(searchState, evaluationInfo);
        }
    }

    evaluateBeginner(searchState: SearchState, request: WordFindingRequest, evaluationInfo: EvaluationInfo): EvaluatedPlacement[] | undefined {
        const movesInRange = this.getMovesInRange(evaluationInfo.foundMoves, request);
        for (const movesScore of movesInRange.values()) {
            for (const move of movesScore) {
                if (searchState === SearchState.Selective && this.acceptMove(move, evaluationInfo.pointDistributionChance)) {
                    return [move];
                } else {
                    const acceptChance = evaluationInfo.pointDistributionChance.get(move.score);
                    if (acceptChance) evaluationInfo.rejectedValidMoves.push({ acceptChance, move });
                }
            }
        }
        if (searchState !== SearchState.Selective && evaluationInfo.rejectedValidMoves.length > 0)
            return [this.getHighestAcceptChanceMove(evaluationInfo.rejectedValidMoves)];
        return undefined;
    }

    evaluateExpert(searchState: SearchState, evaluationInfo: EvaluationInfo): EvaluatedPlacement[] | undefined {
        evaluationInfo.validMoves = evaluationInfo.validMoves.concat(evaluationInfo.foundMoves);
        if (searchState === SearchState.Over) {
            return evaluationInfo.validMoves.sort((previous, current) => current.score - previous.score).slice(0, 1);
        }
        return undefined;
    }

    evaluateHint(evaluationInfo: EvaluationInfo): EvaluatedPlacement[] | undefined {
        evaluationInfo.validMoves = evaluationInfo.validMoves.concat(evaluationInfo.foundMoves);
        if (evaluationInfo.validMoves.length > HINT_AMOUNT_OF_WORDS) {
            return Random.getRandomElementsFromArray(evaluationInfo.validMoves, HINT_AMOUNT_OF_WORDS);
        }
        return undefined;
    }

    getHighestAcceptChanceMove(rejectedValidMoves: RejectedMove[]): EvaluatedPlacement {
        return rejectedValidMoves.sort((previous, current) => current.acceptChance - previous.acceptChance)[0].move;
    }

    updateSearchState(startTime: Date): SearchState {
        const currentTime = new Date();
        const timeElapsed = currentTime.getTime() - startTime.getTime();
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
        if (!request.pointHistory) throw new Error(NO_REQUEST_POINT_HISTORY);
        if (request.pointRange.minimum > request.pointRange.maximum) throw new Error(INVALID_REQUEST_POINT_RANGE);

        const minFrequency = this.findMinRangeFrequency(request);
        const scoreChanceDistribution = new Map<number, number>();

        for (let score = request.pointRange.minimum; score <= request.pointRange.maximum; score++) {
            const scoreFrequency = request.pointHistory.get(score);
            if (scoreFrequency) {
                scoreChanceDistribution.set(score, 1 / (scoreFrequency - minFrequency + 1));
            } else {
                scoreChanceDistribution.set(score, 1);
            }
        }
        return scoreChanceDistribution;
    }

    findMinRangeFrequency(request: WordFindingRequest): number {
        if (!request.pointRange) throw new Error(NO_REQUEST_POINT_RANGE);
        if (!request.pointHistory) throw new Error(NO_REQUEST_POINT_HISTORY);
        if (request.pointRange.minimum > request.pointRange.maximum) throw new Error(INVALID_REQUEST_POINT_RANGE);

        let minFrequency = Number.MAX_VALUE;
        for (let score = request.pointRange.minimum; score < request.pointRange.maximum + 1; score++) {
            const scoreFrequency = request.pointHistory.get(score);
            if (scoreFrequency && scoreFrequency < minFrequency) {
                minFrequency = scoreFrequency;
            }
        }
        return minFrequency;
    }

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

    findMovePossibilities(navigator: BoardNavigator, tileRackSize: number): MovePossibilities {
        const movePossibilities = { isValid: true, minimumLength: this.findMinimumWordLength(navigator), maximumLength: Number.POSITIVE_INFINITY };

        if (movePossibilities.minimumLength > tileRackSize) {
            movePossibilities.isValid = false;
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
            horizontal: this.findMovePossibilities(navigator.clone(), tileRackSize),
            vertical: this.findMovePossibilities(navigator.clone().switchOrientation(), tileRackSize),
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
        if (movePossibilities.isValid && this.isWithin(movePossibilities, permutation.length)) {
            try {
                const createdWords = this.wordExtraction.extract(permutation, squareProperties.square.position, orientation);
                this.wordVerificationService.verifyWords(StringConversion.wordsToString(createdWords), DICTIONARY_NAME);
                return {
                    tilesToPlace: permutation,
                    orientation,
                    startPosition: squareProperties.square.position,
                    score: this.scoreCalculatorService.calculatePoints(createdWords) + this.scoreCalculatorService.bonusPoints(permutation),
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

    combination(tiles: Tile[]) {
        const res: Tile[][] = [[]];
        let temp;
        for (const tile of tiles) {
            if (tile.isBlank) {
                tile.letter = 'E';
                tile.value = 0;
            }
        }
        // Try every combination of either including or excluding each Tile of the array
        // eslint-disable-next-line no-bitwise
        const maxCombinations = 1 << tiles.length;
        for (let i = 0; i < maxCombinations; ++i) {
            temp = [];
            for (let j = 0; j < tiles.length; ++j) {
                // If the tile has to be included in the current combination
                // eslint-disable-next-line no-bitwise
                if (i & (1 << j)) {
                    temp.push(tiles[j]);
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
            const tile = tiles[i];
            const leftTiles = tiles.slice(0, i);
            const rightTiles = tiles.slice(i + 1);
            const rest = leftTiles.concat(rightTiles);
            this.permuteTiles(rest, result, current.concat(tile));
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
