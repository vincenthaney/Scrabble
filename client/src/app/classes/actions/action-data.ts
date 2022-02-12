import { Orientation } from '@app/classes/orientation';
import { Position } from '@app/classes/position';
import { Tile } from '@app/classes/tile';

export enum ActionType {
    PLACE = 'place',
    EXCHANGE = 'exchange',
    PASS = 'pass',
    RESERVE = 'reserve',
    HELP = 'help',
}

export interface ActionPlacePayload {
    tiles: Tile[];
    startPosition: Position;
    orientation: Orientation;
}

export interface ActionExchangePayload {
    tiles: Tile[];
}

export interface ActionData<T extends unknown = unknown> {
    type: ActionType;
    payload: T;
}
