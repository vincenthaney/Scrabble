import ActionPlay from './action-play';
import { Tile } from '@app/classes/tile';
import { Orientation, Position, Square } from '@app/classes/board';
import Game from '../game/game';
import { GameUpdateData } from '../game/game-update-data';
import Player from '../player/player';

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

    execute(game: Game, player: Player): GameUpdateData {
        const containsAll = this.tilesToPlace.every((tile) => {
            return player.tiles.includes(tile);
        });
        if (!containsAll) throw new Error(INVALID_COMMAND);
        this.wordExtraction.extract(game.board, this.tilesToPlace, this.startPosition, this.orientation)

        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
