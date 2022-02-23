import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';

export interface EventTypes {
    tileRackUpdate: void;
    tilesPlayed: ActionPlacePayload;
    noActiveGame: void;
    reRender: void;
    newMessage: Message;
}
