import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HighScore } from '@app/classes/admin/highscore';
import { GameType } from '@app/classes/game-type';

@Injectable({
    providedIn: 'root',
})
export class HighScoreService {
    private lowestHighScore: Map<GameType, number>;
    constructor(private http: HttpClient) {}

    fetchHighScore(gameType: GameType): HighScore[] {
        return [];
    }

    resetHighScores(gameType: GameType): void {
        return;
    }

    addHighScore(highscore: HighScore, gameType: GameType): void {
        return;
    }
}
