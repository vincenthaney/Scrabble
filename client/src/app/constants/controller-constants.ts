import { Message } from '@app/classes/communication/message';
import { SYSTEM_ID } from './game';

export const INITIAL_MESSAGE: Omit<Message, 'gameId'> = {
    content: 'Début de la partie',
    senderId: SYSTEM_ID,
};
