import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';

export interface EventTypes {
    tileRackUpdate: void;
    noActiveGame: void;
    reRender: void;
    newMessage: Message;
    usedTiles: ActionPlacePayload | undefined;
}
