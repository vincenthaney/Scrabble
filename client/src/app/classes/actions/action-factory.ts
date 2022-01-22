import { ActionPass, ActionPlace, ActionExchange, ActionClue, ActionHelp, ActionReserve } from '@app/classes/actions';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { Orientation } from '@app/classes/orientation';

export default class ActionFactory {
    createPass(): ActionPass {
        throw new Error('Method not implemented.');
    }
    createPlaceText(tileToPlace: string, startingSquare: string, orientation: string): ActionPlace {
        throw new Error('Method not implemented.');
    }
    createPlace(tileToPlace: Tile[], startingSquare: Square, orientation: Orientation): ActionPlace {
        throw new Error('Method not implemented.');
    }
    createExchangeText(tilesToExchange: string): ActionExchange {
        throw new Error('Method not implemented.');
    }
    createExchange(tilesToExchange: Tile[]): ActionExchange {
        throw new Error('Method not implemented.');
    }
    createHelp(): ActionHelp {
        throw new Error('Method not implemented.');
    }
    createClue(): ActionClue {
        throw new Error('Method not implemented.');
    }
    createReserve(): ActionReserve {
        throw new Error('Method not implemented.');
    }
}
