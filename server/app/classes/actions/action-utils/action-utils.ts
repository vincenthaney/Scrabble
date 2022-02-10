import { Tile } from '@app/classes/tile';
import Player from '@app/classes/player/player';
import { ERROR_PLAYER_DOESNT_HAVE_TILE } from '@app/classes/actions/action-error';

export class ActionUtils {
    static getTilesFromPlayer(tilesToPlay: Tile[], player: Player, allowWildcard: boolean = true): [played: Tile[], unplayed: Tile[]] {
        const unplayedTiles: Tile[] = player.tiles.map((t) => ({ ...t }));
        const playedTiles: Tile[] = [];

        for (const tile of tilesToPlay) {
            const index = this.getIndexOfTile(unplayedTiles, tile, allowWildcard);
            if (index >= 0) {
                playedTiles.push(unplayedTiles.splice(index, 1)[0]);
            } else {
                throw new Error(ERROR_PLAYER_DOESNT_HAVE_TILE);
            }
        }

        return [playedTiles, unplayedTiles];
    }

    static getIndexOfTile = (tiles: Tile[], tile: Tile, allowWildcard: boolean = true): number => {
        let index = tiles.findIndex((t) => t.letter === tile.letter && t.value === tile.value);

        if (index < 0 && allowWildcard) {
            index = tiles.findIndex((t) => t.letter === '*');
        }

        return index;
    };
}
