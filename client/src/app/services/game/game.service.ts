import { Injectable } from '@angular/core';
import { GameType } from '@app/classes/game-type';
import { GameUpdateData } from '@app/classes/game-update-data';
import { IPlayer } from '@app/classes/player';
import { RoundManagerService } from '@app/services/';

@Injectable({
    providedIn: 'root',
})
export default class GameService {
    // highScoreService: HighScoreService;
    // gameHistoryService: GameHistoryService;
    // objectiveManagerService: ObjectiveManagerService;
    roundManagerService: RoundManagerService;
    opponentPlayer: IPlayer;
    wordsPlayed: string[]; // TODO: Check if useful when implementing word extraction
    gameType: GameType;
    player1: IPlayer;
    player2: IPlayer;

    // playAction(action: Action): void {
    //     throw new Error('Method not implemented.');
    // }

    handleGameUpdate(data: GameUpdateData): void {
        if (data.player1?.name) {
            this.player1.name = data.player1.name;
        }
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
