import { Message } from '@app/classes/communication/message';
import { SYSTEM_ID } from './game';

export const INITIAL_MESSAGE: Omit<Message, 'gameId'> = {
    content: 'Début de la partie',
    senderId: SYSTEM_ID,
};

export const DEFAULT_OPPONENT_NAME = 'steve';
export const DEFAULT_GAME_ID = '42069';
export const DEFAULT_LEAVER = 'PatLePerdant';
export const DEFAULT_SOCKET_ID = 'IDa';
