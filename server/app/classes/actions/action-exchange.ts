import ActionPlay from './action-play';
import { Tile } from '@app/classes/tile';
// import { Game } from '@app/classes/game/game';
import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/game/game-update-data';
import Player from '@app/classes/player/player';

const INVALID_COMMAND = 'a';
export default class ActionExchange extends ActionPlay {
    lettersToExchange: string[];

    constructor(lettersToExchange: string[]) {
        super();
        this.lettersToExchange = lettersToExchange;
    }

    execute(game: Game, player: Player): GameUpdateData {
        const copyLetters = { ...player.tiles };
        const tilesToExchange: Tile[] = [];

        for (const letter of this.lettersToExchange) {
            for (let i = copyLetters.length - 1; i >= 0; i--) {
                if (copyLetters[i].letter === letter) {
                    const tile = copyLetters.splice(i, 1);
                    tilesToExchange.concat(tile);
                    break;
                }
            }
        }

        if (tilesToExchange.length !== this.lettersToExchange.length) throw new Error(INVALID_COMMAND);

        const newTiles = game.tileReserve.swapTiles(tilesToExchange);
        player.tiles = copyLetters.concat(newTiles);

        const response: GameUpdateData = { playerId: player.getId(), player: { tiles: player.tiles } };
        return response;
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
