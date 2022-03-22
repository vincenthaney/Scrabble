import { GameType } from '@app/classes/game-type';

export default interface LobbyData {
    lobbyId: string;
    hostName: string;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}
