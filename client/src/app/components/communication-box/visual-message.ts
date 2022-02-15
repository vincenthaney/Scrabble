import { Message } from '@app/classes/communication/message';

export type VisualMessageClass = 'me' | 'opponent' | 'system' | 'system-error';

export interface VisualMessage extends Message {
    class: VisualMessageClass;
}
