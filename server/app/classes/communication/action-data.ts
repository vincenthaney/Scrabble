import { Orientation } from '@app/classes/board';
import { Tile } from '@app/classes/tile';

export type ActionType = 'place' | 'exchange' | 'pass' | 'help' | 'reserve' | 'hint';

export interface ActionPlacePayload {
    tiles: Tile[];
    startPosition: { column: number; row: number };
    orientation: Orientation;
}

export interface ActionExchangePayload {
    tiles: Tile[];
}

export interface ActionData<T extends unknown = unknown> {
    type: ActionType;
    payload: T;
    input: string;
}
