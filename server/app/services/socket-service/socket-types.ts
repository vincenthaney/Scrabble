import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { LobbyData } from '@app/classes/communication/lobby-data';
import { Message } from '@app/classes/communication/message';
import { PlayerName } from '@app/classes/communication/player-name';
import { StartMultiplayerGameData } from '@app/classes/game/game-config';
import { GameInfoData } from '@app/classes/game/game-info';

export type SocketEmitEvents =
    | 'gameUpdate'
    | 'joinRequest'
    | 'startGame'
    | 'rejected'
    | 'lobbiesUpdate'
    | 'canceledGame'
    | 'joinerLeaveGame'
    | 'gameInfo'
    | 'newMessage'
    | '_test_event';

export type GameUpdateEmitArgs = GameUpdateData;
export type JoinRequestEmitArgs = PlayerName;
export type StartGameEmitArgs = StartMultiplayerGameData;
export type GameInfoEmitArgs = GameInfoData;
export type RejectEmitArgs = PlayerName;
export type CanceledGameEmitArgs = PlayerName;
export type JoinerLeaveGameEmitArgs = PlayerName;
export type LobbiesUpdateEmitArgs = LobbyData[];
export type NewMessageEmitArgs = Message;
