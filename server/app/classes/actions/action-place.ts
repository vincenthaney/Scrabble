import ActionPlay from './action-play';
import { LetterValue, Tile } from '@app/classes/tile';
import { Orientation, Position, Square } from '@app/classes/board';
import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/game/game-update-data';
import Player from '@app/classes/player/player';
import TileReserve from '../tile/tile-reserve';

export default class ActionPlace extends ActionPlay {
    tileLettersToPlace: string[];
    startPosition: Position;
    orientation: Orientation;

    constructor(tileLettersToPlace: string[], startPosition: Position, orientation: Orientation) {
        super();
        this.tileLettersToPlace = tileLettersToPlace;
        this.startPosition = startPosition;
        this.orientation = orientation;
    }

    execute(game: Game, player: Player): GameUpdateData | void {
        const copyLetters = { ...player.tiles };
        const tilesToPlace = [];

        for (const letter of this.tileLettersToPlace) {
            for (let i = copyLetters.length - 1; i >= 0; i--) {
                if (copyLetters[i].letter === letter) {
                    tilesToPlace.push(copyLetters.splice(i, 1));
                    break;
                } else if (copyLetters[i].letter === '*' && (letter.toLowerCase() as LetterValue)) {
                    const tile = copyLetters.splice(i, 1);
                    tile[0].letter = letter.toLowerCase() as LetterValue;
                    tilesToPlace.push(tile);
                    break;
                }
            }
        }

        if (tilesToPlace.length !== this.tileLettersToPlace.length) throw new Error(INVALID_COMMAND);
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
        player.tiles = copyLetters + game.tileReserve.getTiles(copyLetters.length);
        player.score += scoredPoints;

        const response: GameUpdateData = {
            playerId: player.getId(),
            player: { tiles: player.tiles, score: player.score },
        };
        game.endTurn();
        return response;
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
