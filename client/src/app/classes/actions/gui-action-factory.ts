import { ActionPass } from '@app/classes/actions/action-pass';
import { ActionPlace } from '@app/classes/actions/action-place';
import { ActionExchange } from '@app/classes/actions/action-exchange';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';
import { Orientation } from '@app/classes/orientation';

export class GUIActionFactory {
    createPass(): ActionPass {
        return new ActionPass();
    }
    createPlace(tileToPlace: Tile[], startingSquare: Square, Orientation: Orientation): ActionPlace {
        return new ActionPlace();
    }
    createExchange(tilesToExchange: Tile[]): ActionExchange {
        return new ActionExchange();
    }
}
