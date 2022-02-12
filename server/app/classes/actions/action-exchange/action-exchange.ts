import ActionPlay from '@app/classes/actions/action-play';
import { ActionUtils } from '@app/classes/actions/action-utils/action-utils';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Tile } from '@app/classes/tile';

export default class ActionExchange extends ActionPlay {
    tilesToExchange: Tile[];

    constructor(player: Player, game: Game, tilesToExchange: Tile[]) {
        super(player, game);
        this.tilesToExchange = tilesToExchange;
    }

    execute(): GameUpdateData {
        const [tilesToExchange, unusedTiles] = ActionUtils.getTilesFromPlayer(this.tilesToExchange, this.player);

        const newTiles = this.game.tileReserve.swapTiles(tilesToExchange);
        this.player.tiles = unusedTiles.concat(newTiles);

        const playerUpdate: PlayerData = { tiles: this.player.tiles };

        const response: GameUpdateData = {};

        if (this.game.isPlayer1(this.player)) response.player1 = playerUpdate;
        else response.player2 = playerUpdate;

        return response;
    }

    getMessage(): string {
        return `${this.player.name} a échangé les tuiles ${this.tilesToExchange.reduce((prev, tile: Tile) => (prev += tile.letter), '')}.`;
    }
    getOpponentMessage(): string {
        const moreThanOne = this.tilesToExchange.length > 1;
        return `${this.player.name} a échangé ${this.tilesToExchange.length} tuile${moreThanOne ? 's' : ''}.`;
    }
}
