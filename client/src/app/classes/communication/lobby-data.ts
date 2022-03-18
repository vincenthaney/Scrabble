import { GameType } from '@app/classes/game-type';

export default interface LobbyData {
    lobbyId: string;
    playerName: string;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}
