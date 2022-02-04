import ActionPlay from './action-play';
import { LetterValue, Tile } from '@app/classes/tile';
import { Orientation, Position, Square, Square, Square } from '@app/classes/board';
import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/game/game-update-data';
import Player from '@app/classes/player/player';
import TileReserve from '../tile/tile-reserve';

export const WILDCARD_IN_PLACE_ACTION =
    "You can't place a wildcard ('*') on the board, it must have the Capital letter of the letter it will represent";

export default class ActionPlace extends ActionPlay {
    tilesToPlace: Tile[];
    startPosition: Position;
    orientation: Orientation;

    constructor(tilesToPlace: Tile[], startPosition: Position, orientation: Orientation) {
        super();
        this.tilesToPlace = tilesToPlace;
        this.startPosition = startPosition;
        this.orientation = orientation;
    }

    execute(game: Game, player: Player): GameUpdateData | void {
        // const copyLetters = { ...player.tiles };
        // const tilesToPlace = [];

        // for (const letter of this.tileLettersToPlace) {
        //     for (let i = copyLetters.length - 1; i >= 0; i--) {
        //         if (copyLetters[i].letter === letter) {
        //             tilesToPlace.push(copyLetters.splice(i, 1));
        //             break;
        //         } else if (copyLetters[i].letter === '*' && (letter.toLowerCase() as LetterValue)) {
        //             const tile = copyLetters.splice(i, 1);
        //             tile[0].letter = letter.toLowerCase() as LetterValue;
        //             tilesToPlace.push(tile);
        //             break;
        //         }
        //     }
        // }
        const unplayedTiles = { ...player.tiles };
        const tilesToPlace = [];
        for (const tile of this.tilesToPlace) {
            for (let i = unplayedTiles.length - 1; i >= 0; i--) {
                if (tile.letter === '*') {
                    throw new Error(WILDCARD_IN_PLACE_ACTION);
                }
                if (unplayedTiles[i].letter === tile.letter && unplayedTiles[i].value === tile.value) {
                    tilesToPlace.push(unplayedTiles.splice(i, 1));
                    break;
                } else if (tile.value === 0 && unplayedTiles[i].letter === '*') {
                    unplayedTiles.splice(i, 1);
                    tilesToPlace.push(tile);
                    break;
                }
            }
        }

        if (tilesToPlace.length !== this.tilesToPlacepars.length) throw new Error(INVALID_COMMAND);
        const createdWords: [Square, Tile][][] = WordExtraction.extract(game.board, tilesToPlace, this.startPosition, this.orientation);
        const wordsString: string[] = [];
        for (const word of createdWords) {
            let wordString = '';
            for (const squareTile of word) {
                wordString += squareTile[1].letter;
            }
            wordsString.push(wordString);
        }
        const areValidWords = WordValidator.validate(wordsString);

        const scoredPoints = ScoreComputer.compute(createdWords);

        const changedSquares: Square[] = [];
        for (const word of createdWords) {
            for (const squareTile of word) {
                if (!squareTile[0].tile) {
                    squareTile[0].tile = squareTile[1];
                    changedSquares.push(squareTile[0]);
                }
            }
        }

        player.tiles = copyLetters + game.tileReserve.getTiles(copyLetters.length);
        player.score += scoredPoints;

        const response: GameUpdateData = {
            player: { tiles: player.tiles, score: player.score },
            board: changedSquares,
        };
        game.roundManager.nextRound();
        return response;
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
