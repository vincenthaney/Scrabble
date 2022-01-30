import ActionPlay from './action-play';
import { Tile } from '@app/classes/tile';
import { Orientation, Square } from '@app/classes/board';

export default class ActionPlace extends ActionPlay {
    tilesToPlace: Tile[];
    startingSquare: Square;
    orientation: Orientation;

    constructor(tilesToPlace: Tile[], startingSquare: Square, orientation: Orientation) {
        super();
        this.tilesToPlace = tilesToPlace;
        this.startingSquare = startingSquare;
        this.orientation = orientation;
    }

    execute(): void {
        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
