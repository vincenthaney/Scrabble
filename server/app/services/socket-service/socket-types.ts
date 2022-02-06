import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { LobbyData } from '@app/classes/communication/lobby-data';
import { PlayerName } from '@app/classes/communication/player-name';
import { StartMultiplayerGameData } from '@app/classes/game/game-config';

export type SocketEmitEvents = 'gameUpdate' | 'joinRequest' | 'startGame' | 'rejected' | 'lobbiesUpdate' | '_test_event';

export type GameUpdateEmitArgs = GameUpdateData;
export type JoinRequestEmitArgs = PlayerName;
export type StartGameEmitArgs = StartMultiplayerGameData;
export type RejectEmitArgs = undefined;
export type LobbiesUpdateEmitArgs = LobbyData[];
