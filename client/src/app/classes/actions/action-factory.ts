import { ActionPass, ActionPlace, ActionExchange, ActionClue, ActionHelp, ActionReserve } from '@app/classes/actions';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { Orientation } from '@app/classes/orientation';

export default class ActionFactory {
    createPass(): ActionPass {
        return new ActionPass();
    }
    createPlaceText(tileToPlace: string, startingSquare: string, orientation: string): ActionPlace {
        return this.createPlace(tileToPlace, startingSquare, orientation);
    }
    createPlace(tileToPlace: Tile[], startingSquare: Square, orientation: Orientation): ActionPlace {
        return new ActionPlace(tileToPlace, startingSquare, orientation);
    }
    createExchangeText(tilesToExchange: string): ActionExchange {
        return this.createExchange(tilesToExchange);
    }
    createExchange(tilesToExchange: Tile[]): ActionExchange {
        return new ActionExchange(tilesToExchange);
    }
    createHelp(): ActionHelp {
        return new ActionHelp();
    }
    createClue(): ActionClue {
        return new ActionClue();
    }
    createReserve(): ActionReserve {
        return new ActionReserve();
    }
}
