import { Component, Input } from '@angular/core';
import HighScore, { SingleHighScore } from '@app/classes/admin/high-score';
import { GameType } from '@app/classes/game-type';

@Component({
    selector: 'app-high-scores',
    templateUrl: './high-scores.component.html',
    styleUrls: ['./high-scores.component.scss'],
})
export class HighScoresComponent {
    @Input() highScores: HighScore[] = [
        { gameType: GameType.Classic, score: 124, names: ['Elon Moutarde', 'Elon Moutarde2', 'Elon Moutarde3'] },
        { gameType: GameType.Classic, score: 88, names: ['Geff Pezos'] },
        { gameType: GameType.Classic, score: 69, names: ['Captain Bobette', 'Captain Bobette2'] },
        { gameType: GameType.LOG2990, score: 141, names: ['Gee Nette'] },
    ];

    separateHighScores(): SingleHighScore[] {
        const singleHighScores: SingleHighScore[] = [];
        this.highScores.forEach((highScore, index) => {
            let isFirst = true;
            for (const name of highScore.names) {
                if (isFirst) {
                    singleHighScores.push({ ...highScore, name, rank: index + 1 });
                    isFirst = false;
                } else {
                    singleHighScores.push({ ...highScore, name });
                }
            }
        });
        return singleHighScores;
    }
}
