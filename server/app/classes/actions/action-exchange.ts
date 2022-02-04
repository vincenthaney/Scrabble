import ActionPlay from './action-play';
import { Tile } from '@app/classes/tile';
// import { Game } from '@app/classes/game/game';
import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/game/game-update-data';
import Player from '@app/classes/player/player';

const INVALID_COMMAND = 'a';
export default class ActionExchange extends ActionPlay {
    tilesToExchange: Tile[];

    constructor(tilesToExchange: Tile[]) {
        super();
        this.tilesToExchange = tilesToExchange;
    }

    execute(game: Game, player: Player): GameUpdateData {
        const unusedTiles = { ...player.tiles };
        const tilesToExchange: Tile[] = [];

        for (const tile of this.tilesToExchange) {
            for (let i = unusedTiles.length - 1; i >= 0; i--) {
                if (unusedTiles[i].letter === tile.letter && unusedTiles[i].value === tile.value) {
                    tilesToExchange.concat(unusedTiles.splice(i, 1));
                    break;
                }
            }
        }

        if (tilesToExchange.length !== this.tilesToExchange.length) throw new Error(INVALID_COMMAND);

        const newTiles = game.tileReserve.swapTiles(tilesToExchange);
        player.tiles = unusedTiles.concat(newTiles);

        const response: GameUpdateData = { playerId: player.getId(), player: { tiles: player.tiles } };
        return response;
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
