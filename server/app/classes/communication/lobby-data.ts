import { GameType } from '@app/classes/game/game-type';
import { DictionarySummary } from '@app/services/dictionary-service/dictionary.service';

export interface LobbyData {
    lobbyId: string;
    hostName: string;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: DictionarySummary;
}
