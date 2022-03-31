import { GameType } from '@app/classes/game/game-type';
import { DictionarySummary } from '@app/classes/dictionary/dictionary-data';

export interface LobbyData {
    lobbyId: string;
    hostName: string;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: DictionarySummary;
}
