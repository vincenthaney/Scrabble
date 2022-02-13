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
import { Container } from 'typedi';
import { DICTIONARY_NAME } from '@app/constants/services-constants/words-verification.service.const';
import { ActionErrorsMessages } from './action-errors';

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

        this.scoreCalculator = Container.get(ScoreCalculatorService);
        this.wordValidator = Container.get(WordsVerificationService);
    }

    execute(): void | GameUpdateData {
        const [tilesToPlace, unplayedTiles] = ActionUtils.getTilesFromPlayer(this.tilesToPlace, this.player);
        const wordExtraction = new WordExtraction(this.game.board);
        const createdWords: [Square, Tile][][] = wordExtraction.extract(tilesToPlace, this.startPosition, this.orientation);
        if (!this.isLegalPlacement(createdWords)) throw new Error(ActionErrorsMessages.ImpossibleAction);

        this.wordValidator.verifyWords(this.wordToString(createdWords), DICTIONARY_NAME);

        const scoredPoints = this.scoreCalculator.calculatePoints(createdWords) + this.scoreCalculator.bonusPoints(tilesToPlace);

        const updatedSquares = this.updateBoard(createdWords);

        this.player.tiles = unplayedTiles.concat(this.game.getTilesFromReserve(tilesToPlace.length));
        this.player.score += scoredPoints;

        const playerData: PlayerData = { tiles: this.player.tiles, score: this.player.score };

        const response: GameUpdateData = { board: updatedSquares };

        if (this.game.isPlayer1(this.player)) response.player1 = playerData;
        else response.player2 = playerData;

        return response;
    }

    wordToString(words: [Square, Tile][][]): string[] {
        return words.map((word) => word.reduce((previous, [, tile]) => (previous += tile.letter), ''));
    }

    isLegalPlacement(words: [Square, Tile][][]): boolean {
        const isAdjacentToPlacedTile = this.amountOfLettersInWords(words) !== this.tilesToPlace.length;
        if (isAdjacentToPlacedTile) {
            return true;
        } else {
            return this.containsCenterSquare(words);
        }
    }

    amountOfLettersInWords(words: [Square, Tile][][]): number {
        return words.reduce((lettersInWords, word) => (lettersInWords += word.length), 0);
    }

    containsCenterSquare(words: [Square, Tile][][]): boolean {
        return words.some((word) => word.some(([square]) => square.isCenter));
    }

    updateBoard(words: [Square, Tile][][]): Square[] {
        const updatedSquares: Square[] = [];
        for (const word of words) {
            for (const [square, tile] of word) {
                if (!square.tile) {
                    square.tile = tile;
                    square.wasMultiplierUsed = true;
                    const position = square.position;
                    updatedSquares.push(square);
                    this.game.board.placeTile(tile, position);
                }
            }
        }

        return updatedSquares;
    }

    getMessage(): string {
        return `Vous avez placé ${this.tilesToPlace.reduce((prev, tile: Tile) => (prev += tile.letter), '')}`;
    }

    getOpponentMessage(): string {
        return `${this.player.name} a placé ${this.tilesToPlace.reduce((prev, tile: Tile) => (prev += tile.letter), '')}`;
    }
}
