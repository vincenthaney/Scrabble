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
export interface ActionPayload {
    playerId?: string;
}

export interface ExchangeActionPayload extends ActionPayload {
    tiles: Tile[];
}
export interface PlaceActionPayload extends ActionPayload {
    tiles: Tile[];
    startPosition: Position;
    orientation: Orientation;
}
export interface ActionData<T extends ActionPayload = ActionPayload> {
    type: ActionType;
    input: string;
    payload: T;
}
