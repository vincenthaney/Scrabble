import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import HighScore, { SingleHighScore } from '@app/classes/admin/high-score';
import { GameType } from '@app/classes/game-type';
import HighScoresService from '@app/services/high-scores/high-scores.service';
import { Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-high-scores',
    templateUrl: './high-scores.component.html',
    styleUrls: ['./high-scores.component.scss'],
})
export class HighScoresComponent implements OnInit, OnDestroy {
    highScores: HighScore[] = [];

    highScoresParameters: FormGroup = new FormGroup({
        gameType: new FormControl(GameType.Classic, Validators.required),
    });
    gameTypes = GameType;
    componentDestroyed$: Subject<boolean> = new Subject();
    lobbyFullSubscription: Subscription;

    constructor(private highScoresService: HighScoresService) {}

    ngOnInit(): void {
        this.highScoresService.subscribeToHighScoresListEvent(this.componentDestroyed$, (highScores: HighScore[]) => {
            this.updateHighScores(highScores);
        });
        this.highScoresService.handleHighScoresRequest();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    updateHighScores(highScores: HighScore[]): void {
        this.highScores = highScores;
    }

    separateHighScores(): SingleHighScore[] {
        return this.highScoresService.separateHighScores(this.highScores, this.highScoresParameters.get('gameType')?.value);
    }
}
