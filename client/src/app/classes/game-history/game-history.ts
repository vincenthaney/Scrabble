import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';

export interface GameHistory {
    startTime: Date;
    endTime: Date;
    player1Data: PlayerHistoryData;
    player2Data: PlayerHistoryData;
    replacingPlayer?: PlayerHistoryData;
    gameType: GameType;
    gameMode: GameMode;
    isOver: boolean;
    hasBeenAbandoned: boolean;
}

export interface PlayerHistoryData {
    name: string;
    score: number;
    isVirtualPlayer: boolean;
}
