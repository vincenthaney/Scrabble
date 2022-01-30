import { Injectable } from '@angular/core';
import { GameType } from '@app/classes/game-type';
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
    private localPlayer: IPlayer;

    // playAction(action: Action): void {
    //     throw new Error('Method not implemented.');
    // }

    getLocalPlayer(): IPlayer {
        return this.localPlayer;
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
