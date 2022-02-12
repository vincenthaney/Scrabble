import { Message } from '@app/classes/communication/message';

export type VisualMessageClass = 'me' | 'opponent' | 'system';

export interface VisualMessage extends Message {
    class: VisualMessageClass;
}
