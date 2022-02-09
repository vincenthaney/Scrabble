import ActionPlay from '@app/classes/actions/action-play';
import { Orientation, Position } from '@app/classes/board';
import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Player from '@app/classes/player/player';
import { Tile } from '@app/classes/tile';
import { Square } from '@app/classes/square';
import { WordExtraction } from '@app/classes/word-extraction/word-extraction';
import { PlayerData } from '@app/classes/communication/player-data';
import { ERROR_INVALID_WORD } from '@app/classes/actions/action-error';
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';

// TODO: CHANGE THESE WITH THE REAL THINGS
// eslint-disable-next-line @typescript-eslint/naming-convention, no-unused-vars
export const WordValidator = { validate: (s: string[]) => true };
// eslint-disable-next-line @typescript-eslint/naming-convention, no-unused-vars
export const ScoreComputer = { compute: (c: [Square, Tile][][]) => 0 };

export default class ActionPlace extends ActionPlay {
    tilesToPlace: Tile[];
    startPosition: Position;
    orientation: Orientation;

    constructor(player: Player, game: Game, tilesToPlace: Tile[], startPosition: Position, orientation: Orientation) {
        super(player, game);
        this.tilesToPlace = tilesToPlace;
        this.startPosition = startPosition;
        this.orientation = orientation;
    }

    execute(): void | GameUpdateData {
        const [tilesToPlace, unplayedTiles] = ActionUtils.getTilesFromPlayer(this.tilesToPlace, this.player);

        const createdWords: [Square, Tile][][] = WordExtraction.extract(this.game.board, tilesToPlace, this.startPosition, this.orientation);

        // extract tiles from createdWords to have the words as string
        const wordsString = createdWords.map((word) => word.reduce((previous, [, tile]) => (previous += tile.letter), ''));

        const areValidWords = WordValidator.validate(wordsString);

        if (!areValidWords) throw new Error(ERROR_INVALID_WORD);

        const scoredPoints = ScoreComputer.compute(createdWords);

        const updatedBoard = this.updateBoard(createdWords, this.game);

        this.player.tiles = unplayedTiles.concat(this.game.tileReserve.getTiles(tilesToPlace.length));
        this.player.score += scoredPoints;

        const playerData: PlayerData = { tiles: this.player.tiles, score: this.player.score };

        const response: GameUpdateData = { board: updatedBoard };

        if (this.game.isPlayer1(this.player)) response.player1 = playerData;
        else response.player2 = playerData;

        return response;
    }

    updateBoard(words: [Square, Tile][][], game: Game): (Square | undefined)[][] {
        const boardSize = game.board.grid.length;
        const board: (Square | undefined)[][] = Array(boardSize).fill(Array(boardSize).fill(undefined));

        for (const word of words) {
            for (const [square, tile] of word) {
                if (!square.tile) {
                    square.tile = tile;
                    const position = square.position;
                    board[position.row][position.column] = square;
                    game.board.placeTile(tile, position);
                }
            }
        }

        return board;
    }

    getMessage(): string {
        return `${this.player.name} a placé ${this.tilesToPlace.join('')}.`;
    }
}