import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HighScore } from '@app/classes/admin/high-score';
import { GameType } from '@app/classes/game-type';
@Injectable({
    providedIn: 'root',
})
export class HighScoreService {
    private lowestHighScoreOfGameType: Map<GameType, number>;
    constructor(private http: HttpClient) {}

    fetchHighScores(gameType: GameType): HighScore[] {
        throw new Error('Method not implemented.');
    }

    resetHighScores(gameType: GameType): void {
        throw new Error('Method not implemented.');
    }

    addHighScore(highscore: HighScore, gameType: GameType): void {
        throw new Error('Method not implemented.');
    }
}
