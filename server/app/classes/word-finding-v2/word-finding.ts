import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { LetterValue, Tile } from '@app/classes/tile';
import WordFindingRequest from '@app/classes/word-finding/word-finding-request';
import { Dictionary } from '@app/classes/dictionary';
import { ScoredWordPlacement } from '@app/classes/word-finding/word-placement';
import { BoardPlacement, DictionarySearchResult } from './word-finding-types';
import BoardPlacementsExtractor from './board-placement-extractor';
import { Random } from '@app/utils/random';
import DictionarySearcher from './dictionary-searcher';
import { ERROR_PLAYER_DOESNT_HAVE_TILE } from '@app/constants/classes-errors';
import PointRange from '@app/classes/word-finding/point-range';
import { Square } from '@app/classes/square';
import { switchOrientation } from '@app/utils/switch-orientation';
import { BLANK_TILE_LETTER_VALUE, NOT_FOUND } from '@app/constants/game';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import WordFindingUseCase from '@app/classes/word-finding/word-finding-use-case';
import { HINT_ACTION_NUMBER_OF_WORDS } from '@app/constants/classes-constants';

export default abstract class WordFinding {
    protected wordPlacements: ScoredWordPlacement[] = [];

    constructor(
        private board: Board,
        private tiles: Tile[],
        protected request: WordFindingRequest,
        private dictionary: Dictionary,
        private scoreCalculatorService: ScoreCalculatorService,
    ) {}

    findWords(): ScoredWordPlacement[] {
        const playerLetters = this.convertTilesToLetters(this.tiles);

        for (const boardPlacement of this.boardPlacements()) {
            const searcher = new DictionarySearcher(this.dictionary, playerLetters, boardPlacement);

            for (const wordResult of searcher.getWords()) {
                const wordPlacement = this.getWordPlacement(wordResult, boardPlacement);

                if (this.validateWordPlacement(wordPlacement)) {
                    this.handleWordPlacement(wordPlacement);

                    if (this.isSearchCompleted()) return this.wordPlacements;
                }
            }
        }

        return this.wordPlacements;
    }

    *boardPlacements(): Generator<BoardPlacement> {
        const extractor = new BoardPlacementsExtractor(this.board);
        const boardPlacements = extractor.extractBoardPlacements();

        let currentBoardPlacement: BoardPlacement | undefined;
        while ((currentBoardPlacement = Random.popRandom(boardPlacements))) {
            yield currentBoardPlacement;
        }
    }

    getWordPlacement(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): ScoredWordPlacement {
        const wordSquareTiles = this.extractWordSquareTile(wordResult, boardPlacement);
        const perpendicularWordsSquareTiles = this.extractPerpendicularWordsSquareTile(wordResult, boardPlacement);
        const score = this.scoreCalculatorService.calculatePoints([wordSquareTiles, ...perpendicularWordsSquareTiles]);

        const squareTilesToPlace = wordSquareTiles.filter(([square]) => !square.tile);
        const tilesToPlace = squareTilesToPlace.map(([, tile]) => tile);

        return {
            tilesToPlace,
            orientation: boardPlacement.orientation,
            startPosition: squareTilesToPlace[0][0].position,
            score: score + perpendicularWordsSquareTiles.length,
        };
    }

    validateWordPlacement(wordPlacement: ScoredWordPlacement): boolean {
        return this.request.pointRange ? this.isWithinPointRange(wordPlacement.score, this.request.pointRange) : true;
    }

    findCompleted(wordPlacements: ScoredWordPlacement[]): boolean {
        switch (this.request.useCase) {
            case WordFindingUseCase.Hint:
                return wordPlacements.length >= HINT_ACTION_NUMBER_OF_WORDS;
            case WordFindingUseCase.Beginner:
            case WordFindingUseCase.Expert:
                return wordPlacements.length >= 1;
        }
    }

    extractWordSquareTile(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): [Square, Tile][] {
        return this.extractSquareTile(boardPlacement.position, boardPlacement.orientation, wordResult.word);
    }

    extractPerpendicularWordsSquareTile(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): [Square, Tile][][] {
        const squareTiles: [Square, Tile][][] = [];
        for (const { word, distance, connect } of wordResult.perpendicularWords) {
            const navigator = new BoardNavigator(this.board, boardPlacement.position, boardPlacement.orientation);
            const position = navigator.forward(distance).switchOrientation().backward(connect).position;

            squareTiles.push(this.extractSquareTile(position, switchOrientation(boardPlacement.orientation), word));
        }
        return squareTiles;
    }

    extractSquareTile(position: Position, orientation: Orientation, word: string): [Square, Tile][] {
        const navigator = new BoardNavigator(this.board, position, orientation);
        const playerTiles = [...this.tiles];
        const squareTiles: [Square, Tile][] = [];

        for (let i = 0; i < word.length; ++i) {
            let tile: Tile;
            if (!navigator.square.tile) {
                tile = this.getTileFromLetter(playerTiles, word.charAt(i));
            } else {
                tile = navigator.square.tile;
            }

            squareTiles.push([navigator.square, tile]);

            navigator.forward();
        }

        return squareTiles;
    }

    getTileFromLetter(tiles: Tile[], letter: string): Tile {
        let index = tiles.findIndex((tile) => tile.letter === letter.toUpperCase());

        if (index === NOT_FOUND) {
            index = tiles.findIndex((tile) => tile.letter === BLANK_TILE_LETTER_VALUE);
            if (index === NOT_FOUND) throw new Error(ERROR_PLAYER_DOESNT_HAVE_TILE);
            const foundBlankTile = tiles.splice(index, 1);
            return { ...foundBlankTile[0], playedLetter: letter.toUpperCase() as LetterValue };
        }

        const foundTile = tiles.splice(index, 1);
        return foundTile[0];
    }

    calculateScore(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): number {
        return wordResult.word.length + boardPlacement.orientation;
    }

    convertTilesToLetters(tiles: Tile[]): LetterValue[] {
        return tiles.map((tile) => tile.letter);
    }

    isWithinPointRange(score: number, range: PointRange) {
        return score >= range.minimum && score <= range.maximum;
    }

    abstract handleWordPlacement(wordPlacement: ScoredWordPlacement): void;

    abstract isSearchCompleted(): boolean;
}
