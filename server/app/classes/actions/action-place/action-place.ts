// import { ERROR_INVALID_WORD } from '@app/classes/actions/action-error';
import ActionPlay from '@app/classes/actions/action-play';
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import { Orientation, Position } from '@app/classes/board';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { DICTIONARY_NAME } from '@app/services/words-verification-service/words-verification.service.const';
import { BINGO_BONUS_POINTS, MAX_TILE_PER_PLAYER } from './action-place.const';

export default class ActionPlace extends ActionPlay {
    tilesToPlace: Tile[];
    startPosition: Position;
    orientation: Orientation;
    private scoreCalculator: ScoreCalculatorService;
    private wordValidator: WordsVerificationService;
    constructor(player: Player, game: Game, tilesToPlace: Tile[], startPosition: Position, orientation: Orientation) {
        super(player, game);
        this.tilesToPlace = tilesToPlace;
        this.startPosition = startPosition;
        this.orientation = orientation;
    }

    isABingo(): boolean {
        return this.tilesToPlace.length === MAX_TILE_PER_PLAYER;
    }

    execute(): void | GameUpdateData {
        const [tilesToPlace, unplayedTiles] = ActionUtils.getTilesFromPlayer(this.tilesToPlace, this.player);
        const wordExtraction = new WordExtraction(this.game.board);
        // TODO: Catch errors from extraction and make it a message
        const createdWords: [Square, Tile][][] = wordExtraction.extract(tilesToPlace, this.startPosition, this.orientation);
        // TODO: Use mathilde's errors and correctly catch it
        if (!this.isLegalPlacement(createdWords)) throw new Error('COMMANDE INVALIDE');

        const wordsString = this.wordToString(createdWords);

        this.wordValidator.verifyWords(wordsString, DICTIONARY_NAME);

        let scoredPoints = this.scoreCalculator.calculatePoints(createdWords);
        if (this.isABingo()) scoredPoints += BINGO_BONUS_POINTS;

        const updatedBoard = this.updateBoard(createdWords);

        this.player.tiles = unplayedTiles.concat(this.game.getTiles(tilesToPlace.length));
        this.player.score += scoredPoints;

        const playerData: PlayerData = { tiles: this.player.tiles, score: this.player.score };

        const response: GameUpdateData = { board: updatedBoard };

        if (this.game.isPlayer1(this.player)) response.player1 = playerData;
        else response.player2 = playerData;

        return response;
    }

    wordToString(words: [Square, Tile][][]): string[] {
        return words.map((word) => word.reduce((previous, [, tile]) => (previous += tile.letter), ''));
    }

    isLegalPlacement(words: [Square, Tile][][]): boolean {
        if (this.amountOfLettersInWords(words) !== this.tilesToPlace.length) {
            return true;
        } else {
            return this.containsCenterSquare(words);
        }
    }

    amountOfLettersInWords(words: [Square, Tile][][]): number {
        return words.reduce((lettersInWords, word) => (lettersInWords += word.length), 0);
    }

    containsCenterSquare(words: [Square, Tile][][]): boolean {
        for (const word of words) {
            for (const [square] of word) {
                if (square.isCenter) {
                    return true;
                }
            }
        }
        return false;
    }

    updateBoard(words: [Square, Tile][][]): Square[] {
        const board: Square[] = [];
        for (const word of words) {
            for (const [square, tile] of word) {
                if (!square.tile) {
                    square.tile = tile;
                    const position = square.position;
                    board.push(square);
                    this.game.board.placeTile(tile, position);
                }
            }
        }

        return board;
    }

    getMessage(): string {
        return `${this.player.name} a placé ${this.tilesToPlace.join('')}.`;
    }
}
