import { Component, Input } from '@angular/core';
import { SingleHighScore } from '@app/classes/admin/high-score';
import { GameType } from '@app/classes/game-type';

@Component({
    selector: 'app-high-score-box',
    templateUrl: './high-score-box.component.html',
    styleUrls: ['./high-score-box.component.scss'],
})
export class HighScoreBoxComponent {
    @Input() highScore: SingleHighScore = { name: 'player1', gameType: GameType.Classic, score: 0 };
}
