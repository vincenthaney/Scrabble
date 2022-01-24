import { Injectable } from '@angular/core';
import { TileReserve } from '@app/classes/tile';
import { Action } from '@app/classes/actions/action';

import { GameType } from '@app/classes/game-type';
import { RoundManagerService } from '@app/services/round-manager/round-manager.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    // highScoreService: HighScoreService;
    // gameHistoryService: GameHistoryService;
    // objectiveManagerService: ObjectiveManagerService;
    roundManagerService: RoundManagerService;
    // player1: IPlayer;
    // player2: IPlayer;
    tileReserve: TileReserve;
    wordsPlayed: string[]; // TODO: Check if useful when implementing word extraction
    gameType: GameType;

    playAction(action: Action): void {
        throw new Error('Method not implemented.');
    }

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
