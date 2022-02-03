import { ActionPlay } from '@app/classes/actions';
import { Position } from '@app/classes/position';
import { Square } from '@app/classes/square';

export interface ActionPlacePayload {
    letters: string[];
    startPosition: Position;
    // eslint-disable-next-line max-len
    orientation: string; // ne peut pas être une orientation parce sinon ça implique je je dois faire le traitement pour convertir la lettre en Orientation et traiter les erreurs dans le client
}

export default class ActionPlace extends ActionPlay {
    lettersToPlace: string[];
    startingSquare: Square;
    orientation: string;

    constructor(lettersToPlace: string[], startingSquare: Square, orientation: string) {
        super();
        this.lettersToPlace = lettersToPlace;
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
