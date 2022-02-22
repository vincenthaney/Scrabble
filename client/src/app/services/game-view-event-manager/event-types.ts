import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';
import { UpdateTileReserveEventArgs } from './event-arguments';

export interface EventArgs {
    tileRackUpdate: void;
    tilesPlayed: ActionPlacePayload;
    noActiveGame: void;
    reRender: void;
    tileReserveUpdate: UpdateTileReserveEventArgs;
    newMessage: Message;
}
