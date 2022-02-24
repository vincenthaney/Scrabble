import { Orientation } from '@app/classes/orientation';
import { Position } from '@app/classes/position';
import { Tile } from '@app/classes/tile';

export const ACTION_COMMAND_INDICATOR = '!';

export enum ActionType {
    PLACE = 'placer',
    EXCHANGE = 'échanger',
    PASS = 'passer',
    RESERVE = 'réserve',
    HELP = 'aide',
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
    input: string;
    payload: T;
}
