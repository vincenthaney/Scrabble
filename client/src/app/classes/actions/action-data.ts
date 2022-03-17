/* eslint-disable @typescript-eslint/ban-types */
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
    HINT = 'indice',
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ActionPayload {}

export interface ExchangeActionPayload extends ActionPayload {
    tiles: Tile[];
}
export interface PlaceActionPayload extends ActionPayload {
    tiles: Tile[];
    startPosition: Position;
    orientation: Orientation;
}

export interface ActionData<T extends ActionPayload = {}> {
    type: ActionType;
    input: string;
    payload: T;
}
