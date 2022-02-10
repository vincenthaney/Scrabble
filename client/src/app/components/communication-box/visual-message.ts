import { Message } from '@app/classes/communication/message';

export enum VisualMessageClasses {
    Me = 'me',
    Opponent = 'opponent',
    System = 'system',
}

export interface VisualMessage extends Message {
    class: VisualMessageClasses;
}
