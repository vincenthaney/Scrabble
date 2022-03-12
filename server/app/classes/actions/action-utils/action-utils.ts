import Player from '@app/classes/player/player';
import { Tile } from '@app/classes/tile';
import { ERROR_PLAYER_DOESNT_HAVE_TILE } from '@app/constants/classes-errors';

export class ActionUtils {
    static getTilesFromPlayer(tilesToPlay: Tile[], player: Player, allowWildcard: boolean = true): [played: Tile[], unplayed: Tile[]] {
        const unplayedTiles: Tile[] = player.tiles.map((t) => ({ ...t }));
        const playedTiles: Tile[] = [];

        for (const tile of tilesToPlay) {
            const index = this.getIndexOfTile(unplayedTiles, tile, allowWildcard);
            if (index >= 0) {
                const playerTile = unplayedTiles.splice(index, 1)[0];
                if (this.isBlankTile(playerTile)) {
                    playerTile.playedLetter = tile.letter;
                    playerTile.isBlank = true;
                }
                playedTiles.push(playerTile);
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

    static isBlankTile(tile: Tile): boolean {
        return tile.isBlank || tile.letter === '*';
    }
}
