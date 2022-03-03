import { Orientation } from '@app/classes/board';
import { Tile } from '@app/classes/tile';

export enum ActionType {
    PLACE = 'placer',
    EXCHANGE = 'échanger',
    PASS = 'passer',
    RESERVE = 'réserve',
    HELP = 'aide',
    HINT = 'indice',
}

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
