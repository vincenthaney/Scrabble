import { Orientation } from '@app/classes/orientation';
import { Tile } from '@app/classes/tile';

export enum ActionType {
    PLACE = 'place',
    EXCHANGE = 'exchange',
    PASS = 'pass',
}

export interface ActionPlacePayload {
    tiles: Tile[];
    position: { column: number; row: number };
    orientation: Orientation;
}

export interface ActionExchangePayload {
    tiles: Tile[];
}

export interface ActionData<T extends unknown = unknown> {
    type: ActionType;
    payload: T;
}
