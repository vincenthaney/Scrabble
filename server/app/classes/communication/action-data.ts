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

export interface ActionPayload {
    tiles: Tile[];
}
export interface ActionPlacePayload extends ActionPayload {
    startPosition: { column: number; row: number };
    orientation: Orientation;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ActionExchangePayload extends ActionPayload {}

export interface ActionData {
    type: ActionType;
    payload: ActionPayload;
    input: string;
}
