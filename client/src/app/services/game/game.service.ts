import { Injectable } from '@angular/core';
import { GameType } from '@app/classes/game-type';
import { TileReserve } from '@app/classes/tile-reserve';
import { RoundManagerService } from '@app/services';

@Injectable({
    providedIn: 'root',
})
export default class GameService {
    // highScoreService: HighScoreService;
    // gameHistoryService: GameHistoryService;
    // objectiveManagerService: ObjectiveManagerService;
    roundManagerService: RoundManagerService;
    // player1: IPlayer;
    // player2: IPlayer;
    tileReserve: TileReserve;
    wordsPlayed: string[]; // TODO: Check if useful when implementing word extraction
    gameType: GameType;

    isGameOver(): boolean {
        throw new Error('Method not implemented.');
    }

    sendScores(): void {
        throw new Error('Method not implemented.');
    }

    // TODO: Maybe rename to sendGame or sendFinishedGame
    sendGameHistory(): void {
        throw new Error('Method not implemented.');
    }
}
