import { GameType } from '@app/classes/game/game-type';

export interface LobbyData {
    lobbyId: string;
    hostName: string;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}
