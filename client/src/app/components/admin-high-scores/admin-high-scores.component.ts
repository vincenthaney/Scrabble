import { Component, OnDestroy, OnInit } from '@angular/core';
import { SingleHighScore } from '@app/classes/admin/high-score';
import { GameType } from '@app/constants/game-type';
import HighScoresService from '@app/services/high-score-service/high-score.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-admin-high-scores',
    templateUrl: './admin-high-scores.component.html',
    styleUrls: ['./admin-high-scores.component.scss'],
})
export class AdminHighScoresComponent implements OnInit, OnDestroy {
    isInitialized: boolean = false;

    private componentDestroyed$: Subject<boolean> = new Subject();

    constructor(private readonly highScoresService: HighScoresService) {}

    ngOnInit(): void {
        this.highScoresService.handleHighScoresRequest();
        this.highScoresService.subscribeToInitializedHighScoresListEvent(this.componentDestroyed$, () => {
            this.isInitialized = true;
        });
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    getClassicHighScores(): SingleHighScore[] {
        return this.highScoresService.getHighScores(GameType.Classic);
    }

    getLog2990HighScores(): SingleHighScore[] {
        return this.highScoresService.getHighScores(GameType.LOG2990);
    }

    resetHighScores(): void {
        this.highScoresService.resetHighScores();
    }
}
