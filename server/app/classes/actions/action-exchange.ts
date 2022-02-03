import ActionPlay from './action-play';
import { Tile } from '@app/classes/tile';
// import { Game } from '@app/classes/game/game';
import Player from '../player/player';
import Game from '@app/classes/game/game';
import { GameUpdateData, PlayerData } from '../game/game-update-data';

const INVALID_COMMAND = 'a';
export default class ActionExchange extends ActionPlay {
    tilesToExchange: Tile[];

    constructor(tilesToExchange: Tile[]) {
        super();
        this.tilesToExchange = tilesToExchange;
    }

    // eslint-disable-next-line no-unused-vars
    execute(game: Game, player: Player): GameUpdateData {
        const containsAll = this.tilesToExchange.every((tile) => {
            return player.tiles.includes(tile);
        });
        if (!containsAll) throw new Error(INVALID_COMMAND);

        const newTiles = player.tiles.filter((tile) => {
            return !this.tilesToExchange.includes(tile);
        });
        newTiles.concat(game.tileReserve.swapTiles(this.tilesToExchange));

        const response: GameUpdateData = { playerId: player.getId(), player: { tiles: newTiles } };
        return response;
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
