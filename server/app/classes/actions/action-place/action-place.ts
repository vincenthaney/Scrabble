import ActionPlay from '@app/classes/actions/action-play';
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import { ActionData, ActionPlacePayload, ActionType } from '@app/classes/communication/action-data';
import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { ScoredWordPlacement, WordPlacement } from '@app/classes/word-finding';
import { IN_UPPER_CASE } from '@app/constants/classes-constants';
import { ScoreCalculatorService } from '@app/services/score-calculator-service/score-calculator.service';
import { WordsVerificationService } from '@app/services/words-verification-service/words-verification.service';
import { PlacementToString } from '@app/utils/placement-to-string';
import { StringConversion } from '@app/utils/string-conversion';
import { Container } from 'typedi';
import { ActionErrorsMessages } from './action-errors';

export default class ActionPlace extends ActionPlay {
    wordPlacement: WordPlacement;
    private scoreCalculator: ScoreCalculatorService;
    private wordValidator: WordsVerificationService;
    constructor(player: Player, game: Game, wordPlacement: WordPlacement) {
        super(player, game);
        this.wordPlacement = wordPlacement;
        this.scoreCalculator = Container.get(ScoreCalculatorService);
        this.wordValidator = Container.get(WordsVerificationService);
    }

    static createActionData(scoredWordPlacement: ScoredWordPlacement): ActionData {
        return {
            type: ActionType.PLACE,
            payload: this.createActionPlacePayload(scoredWordPlacement),
            input: '',
        };
    }

    private static createActionPlacePayload(scoredWordPlacement: ScoredWordPlacement): ActionPlacePayload {
        return {
            tiles: scoredWordPlacement.tilesToPlace,
            orientation: scoredWordPlacement.orientation,
            startPosition: scoredWordPlacement.startPosition,
        };
    }

    execute(): void | GameUpdateData {
        const [tilesToPlace, unplayedTiles] = ActionUtils.getTilesFromPlayer(this.wordPlacement.tilesToPlace, this.player);

        const wordExtraction = new WordExtraction(this.game.board);
        const createdWords: [Square, Tile][][] = wordExtraction.extract(this.wordPlacement);
        if (!this.isLegalPlacement(createdWords)) throw new Error(ActionErrorsMessages.ImpossibleAction);

        this.wordValidator.verifyWords(StringConversion.wordsToString(createdWords), this.game.dictionnaryName);

        const scoredPoints = this.scoreCalculator.calculatePoints(createdWords) + this.scoreCalculator.bonusPoints(tilesToPlace);

        // Valider objectif
        const gameObjectivesData: GameObjectivesData = this.player.updateObjectives({
            wordPlacement: this.wordPlacement,
            game: this.game,
            scoredPoints,
            createdWords,
        });

        const updatedSquares = this.updateBoard(createdWords);

        this.player.tiles = unplayedTiles.concat(this.game.getTilesFromReserve(tilesToPlace.length));
        this.player.score += scoredPoints;

        const playerData: PlayerData = { id: this.player.id, tiles: this.player.tiles, score: this.player.score };

        const response: GameUpdateData = { board: updatedSquares, gameObjective: gameObjectivesData };

        if (this.game.isPlayer1(this.player)) response.player1 = playerData;
        else response.player2 = playerData;
        return response;
    }

    getMessage(): string {
        return `Vous avez placé ${PlacementToString.tilesToString(this.wordPlacement.tilesToPlace, IN_UPPER_CASE)}`;
    }

    getOpponentMessage(): string {
        return `${this.player.name} a placé ${PlacementToString.tilesToString(this.wordPlacement.tilesToPlace, IN_UPPER_CASE)}`;
    }

    private isLegalPlacement(words: [Square, Tile][][]): boolean {
        const isAdjacentToPlacedTile = this.amountOfLettersInWords(words) !== this.wordPlacement.tilesToPlace.length;
        return isAdjacentToPlacedTile ? true : this.containsCenterSquare(words);
    }

    private amountOfLettersInWords(words: [Square, Tile][][]): number {
        return words.reduce((lettersInWords, word) => lettersInWords + word.length, 0);
    }

    private containsCenterSquare(words: [Square, Tile][][]): boolean {
        return words.some((word) => word.some(([square]) => square.isCenter));
    }

    private updateBoard(words: [Square, Tile][][]): Square[] {
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
}
