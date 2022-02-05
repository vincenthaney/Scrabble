import { Tile } from '@app/classes/tile';
import { Orientation } from '@app/classes/board';

export type ActionType = 'place' | 'exchange' | 'pass';

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
