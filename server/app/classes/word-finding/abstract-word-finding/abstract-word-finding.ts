import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { LetterValue, Tile } from '@app/classes/tile';
import { Dictionary } from '@app/classes/dictionary';
import { Random } from '@app/utils/random';
import { Square } from '@app/classes/square';
import { switchOrientation } from '@app/utils/switch-orientation';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { arrayDeepCopy } from '@app/utils/deep-copy';
import {
    BoardPlacement,
    BoardPlacementsExtractor,
    DictionarySearcher,
    DictionarySearchResult,
    ScoredWordPlacement,
    WordFindingRequest,
} from '@app/classes/word-finding';
import { ERROR_PLAYER_DOESNT_HAVE_TILE } from '@app/constants/classes-errors';
import { BLANK_TILE_LETTER_VALUE, NOT_FOUND } from '@app/constants/game';

export default abstract class AbstractWordFinding {
    protected wordPlacements: ScoredWordPlacement[] = [];

    constructor(
        private board: Board,
        private tiles: Tile[],
        protected request: WordFindingRequest,
        private dictionary: Dictionary,
        private scoreCalculatorService: ScoreCalculatorService,
    ) {
        this.tiles = arrayDeepCopy(this.tiles);
    }

    findWords(): ScoredWordPlacement[] {
        const playerLetters = this.convertTilesToLetters(this.tiles);

        for (const boardPlacement of this.randomBoardPlacements()) {
            const searcher = new DictionarySearcher(this.dictionary, playerLetters, boardPlacement);

            for (const wordResult of searcher.getAllWords()) {
                const wordPlacement = this.getWordPlacement(wordResult, boardPlacement);

                if (this.validateWordPlacement(wordPlacement)) {
                    this.handleWordPlacement(wordPlacement);

                    if (this.isSearchCompleted()) return this.wordPlacements;
                }
            }
        }

        return this.wordPlacements;
    }

    protected isWithinPointRange(score: number): boolean {
        if (!this.request.pointRange) return true;
        return this.request.pointRange.isWithinRange(score);
    }

    private *randomBoardPlacements(): Generator<BoardPlacement> {
        const extractor = new BoardPlacementsExtractor(this.board);
        const boardPlacements = extractor.extractBoardPlacements();

        let currentBoardPlacement: BoardPlacement | undefined;
        while ((currentBoardPlacement = Random.popRandom(boardPlacements))) {
            yield currentBoardPlacement;
        }
    }

    private getWordPlacement(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): ScoredWordPlacement {
        const wordSquareTiles = this.extractWordSquareTile(wordResult, boardPlacement);
        const perpendicularWordsSquareTiles = this.extractPerpendicularWordsSquareTile(wordResult, boardPlacement);
        const score = this.scoreCalculatorService.calculatePoints([wordSquareTiles, ...perpendicularWordsSquareTiles]);

        const squareTilesToPlace = wordSquareTiles.filter(([square]) => !square.tile);
        const tilesToPlace = squareTilesToPlace.map(([, tile]) => tile);

        return {
            tilesToPlace,
            orientation: boardPlacement.orientation,
            startPosition: squareTilesToPlace[0][0].position,
            score,
        };
    }

    private validateWordPlacement(wordPlacement: ScoredWordPlacement): boolean {
        return this.isWithinPointRange(wordPlacement.score);
    }

    private extractWordSquareTile(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): [Square, Tile][] {
        return this.extractSquareTile(boardPlacement.position, boardPlacement.orientation, wordResult.word);
    }

    private extractPerpendicularWordsSquareTile(wordResult: DictionarySearchResult, boardPlacement: BoardPlacement): [Square, Tile][][] {
        const squareTiles: [Square, Tile][][] = [];
        for (const { word, distance, junctionDistance } of wordResult.perpendicularWords) {
            squareTiles.push(
                this.extractSquareTile(
                    this.getPerpendicularWordPosition(boardPlacement, distance, junctionDistance),
                    switchOrientation(boardPlacement.orientation),
                    word,
                ),
            );
        }
        return squareTiles;
    }

    private extractSquareTile(position: Position, orientation: Orientation, word: string): [Square, Tile][] {
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

    private getTileFromLetter(tiles: Tile[], letter: string): Tile {
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

    private convertTilesToLetters(tiles: Tile[]): LetterValue[] {
        return tiles.map((tile) => tile.letter);
    }

    private getPerpendicularWordPosition(boardPlacement: BoardPlacement, distance: number, junctionDistance: number): Position {
        return new BoardNavigator(this.board, boardPlacement.position, boardPlacement.orientation)
            .forward(distance)
            .switchOrientation()
            .backward(junctionDistance).position;
    }

    protected abstract handleWordPlacement(wordPlacement: ScoredWordPlacement): void;

    protected abstract isSearchCompleted(): boolean;
}
