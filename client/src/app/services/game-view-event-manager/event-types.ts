import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { InitializeGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { BehaviorSubject, Subject } from 'rxjs';

export interface EventTypes {
    tileRackUpdate: void;
    noActiveGame: void;
    reRender: void;
    newMessage: Message | null;
    usedTiles: ActionPlacePayload | undefined;
    gameInitialized: InitializeGameData | undefined;
}

type GenericEventClass<T> = {
    [S in keyof T]: Subject<T[S]>;
};

export interface EventClass extends GenericEventClass<EventTypes> {
    newMessage: BehaviorSubject<Message | null>;
    usedTiles: BehaviorSubject<ActionPlacePayload | undefined>;
    gameInitialized: BehaviorSubject<InitializeGameData | undefined>;
}
