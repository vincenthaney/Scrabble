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
    private highScoresMap: Map<GameType, SingleHighScore[]> = new Map();

    constructor(private highScoresController: HighScoresController) {
        this.highScoresController.subscribeToHighScoresListEvent(this.serviceDestroyed$, (highScores: HighScore[]) => {
            this.updateHighScores(highScores);
        });
    }

    handleHighScoresRequest(): void {
        this.highScoresController.handleGetHighScores();
    }

    subscribeToHighScoresListEvent(componentDestroyed$: Subject<boolean>, callback: (highScores: HighScore[]) => void): void {
        this.highScoresListEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    getHighScores(gameType: GameType): SingleHighScore[] {
        const highScores = this.highScoresMap.get(gameType);
        return highScores ? highScores : [];
    }

    private updateHighScores(highScores: HighScore[]): void {
        const [classicHighScores, log2990HighScores] = this.separateHighScoresType(highScores);
        this.highScoresMap.set(GameType.Classic, this.separateHighScores(classicHighScores));
        this.highScoresMap.set(GameType.LOG2990, this.separateHighScores(log2990HighScores));
    }

    private separateHighScoresType(highScores: HighScore[]): [HighScore[], HighScore[]] {
        const classicHighScores: HighScore[] = [];
        const log2990HighScores: HighScore[] = [];

        highScores.forEach((highScore) => {
            if (highScore.gameType === GameType.Classic) classicHighScores.push(highScore);
            else log2990HighScores.push(highScore);
        });

        return [classicHighScores, log2990HighScores];
    }

    private separateHighScores(highScores: HighScore[]): SingleHighScore[] {
        const singleHighScores: SingleHighScore[] = [];
        let rank = 1;
        highScores
            .sort((previous, current) => current.score - previous.score)
            .forEach((highScore) => {
                let isFirst = true;
                for (const name of highScore.names) {
                    if (isFirst) {
                        singleHighScores.push({ ...highScore, name, rank: rank++ });
                        isFirst = false;
                    } else {
                        singleHighScores.push({ ...highScore, name });
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
