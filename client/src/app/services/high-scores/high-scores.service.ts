import { Injectable } from '@angular/core';
import { HighScore } from '@app/classes/admin';
import { SingleHighScore } from '@app/classes/admin/high-score';
import { GameType } from '@app/classes/game-type';
import { HighScoresController } from '@app/controllers/high-scores-controller/high-scores.controller';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})
export default class HighScoresService {
    private serviceDestroyed$: Subject<boolean> = new Subject();
    private highScoresListEvent: Subject<HighScore[]> = new Subject();

    constructor(private highScoresController: HighScoresController) {
        this.highScoresController.subscribeToHighScoresListEvent(this.serviceDestroyed$, (highScores: HighScore[]) => {
            this.handleHighScoresList(highScores);
        });
    }

    handleHighScoresList(highScores: HighScore[]): void {
        this.highScoresListEvent.next(highScores);
    }

    handleHighScoresRequest(): void {
        this.highScoresController.handleGetHighScores();
    }

    subscribeToHighScoresListEvent(componentDestroyed$: Subject<boolean>, callback: (highScores: HighScore[]) => void): void {
        this.highScoresListEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    separateHighScores(highScores: HighScore[], gameType: GameType): SingleHighScore[] {
        const singleHighScores: SingleHighScore[] = [];
        let rank = 1;
        highScores.forEach((highScore) => {
            if (highScore.gameType === gameType) {
                let isFirst = true;
                for (const name of highScore.names) {
                    if (isFirst) {
                        singleHighScores.push({ ...highScore, name, rank: rank++ });
                        isFirst = false;
                    } else {
                        singleHighScores.push({ ...highScore, name });
                    }
                }
            }
        });
        return singleHighScores;
    }
}

// resetHighScores(gameType: GameType): void {
//     throw new Error('Method not implemented.');
// }
// addHighScore(highscore: HighScore, gameType: GameType): void {
//     throw new Error('Method not implemented.');
// }
