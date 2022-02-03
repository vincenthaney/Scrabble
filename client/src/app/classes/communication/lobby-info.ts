import { GameType } from '../game-type';

export interface LobbyInfo {
    lobbyID: number;
    playerName: string;
    gameType: GameType;
    timer: number;
    canJoin: boolean;
}
