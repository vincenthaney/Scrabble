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

// const squareTileToString = ([square, tile]: [Square, Tile]) =>
//     `(${square.position.row}, ${square.position.column}) ${tile.letter}${square.tile ? '' : ' (N)'}`;
const posToStr = (position: Position) => `(${position.row}, ${position.column})`;
const orientationToString = (orientation: Orientation) => (orientation === Orientation.Horizontal ? 'H' : 'V');

export default class WordFinding {
    constructor(private board: Board, private tiles: Tile[], private request: WordFindingRequest, private dictionary: Dictionary) {}

    findWords(): ScoredWordPlacement[] {
        const wordPlacements: ScoredWordPlacement[] = [];
        const playerLetters = this.convertTilesToLetters(this.tiles);

        for (const boardPlacement of this.boardPlacements()) {
            const searcher = new DictionarySearcher(this.dictionary, playerLetters, boardPlacement);

            console.log(
                posToStr(boardPlacement.position),
                orientationToString(boardPlacement.orientation),
                boardPlacement.letters.map((a) => [a.letter, a.distance]),
            );

            for (const wordResult of searcher.getWords()) {
                console.log(
                    wordResult.word,
                    `(${boardPlacement.position.row}, ${boardPlacement.position.column})`,
                    orientationToString(boardPlacement.orientation),
                    wordResult.perpendicularWords,
                );
                const wordPlacement = this.getWordPlacement(wordResult, boardPlacement);

                if (this.validateWordPlacement(wordPlacement)) {
                    wordPlacements.push(wordPlacement);

                    if (this.findCompleted(wordPlacements)) return wordPlacements;
                }
            }
        }

        return wordPlacements;
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
        const score = this.calculateScore(wordResult, boardPlacement);

        // console.log('===== word', wordSquareTiles.map(squareTileToString));
        // console.log('===== perpendicularWords');
        // for (const p of perpendicularWordsSquareTiles) {
        //     console.log('=== ', p.map(squareTileToString));
        // }

        return {
            tilesToPlace: wordSquareTiles.map(([, tile]) => tile),
            orientation: boardPlacement.orientation,
            startPosition: boardPlacement.position,
            score: score + perpendicularWordsSquareTiles.length,
        };
    }

    validateWordPlacement(wordPlacement: ScoredWordPlacement): boolean {
        return this.request.pointRange ? this.isWithinPointRange(wordPlacement.score, this.request.pointRange) : true;
    }

    findCompleted(wordPlacements: ScoredWordPlacement[]): boolean {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return wordPlacements.length > 3;
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
                const index = playerTiles.findIndex((playerTile) => playerTile.letter === word.charAt(i).toUpperCase());
                const foundTile = playerTiles.splice(index, 1).pop();

                if (!foundTile) throw new Error(ERROR_PLAYER_DOESNT_HAVE_TILE);
                tile = foundTile;
            } else {
                tile = navigator.square.tile;
            }

            squareTiles.push([navigator.square, tile]);

            navigator.forward();
        }

        return squareTiles;
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
}
