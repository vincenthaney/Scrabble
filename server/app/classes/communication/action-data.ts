import { Tile } from '@app/classes/tile';

export type ActionType = 'place' | 'exchange' | 'pass';

export interface ActionPlacePayload {
    tiles: Tile[];
    position: { column: number; row: number };
    orientation: 'vertical' | 'horizontal';
}

export interface ActionExchangePayload {
    tiles: Tile[];
}

export interface ActionData<T extends unknown = unknown> {
    type: ActionType;
    payload: T;
}
