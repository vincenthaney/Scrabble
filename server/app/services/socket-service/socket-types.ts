import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';

export type SocketEmitEvents = 'gameUpdate' | 'joinRequest' | 'startGame' | 'rejected' | '_test_event';

export type GameUpdateEmitArgs = GameUpdateData;
export type JoinRequestEmitArgs = { opponentName: string };
export type StartGameEmitArgs = Game;
export type RejectEmitArgs = undefined;
