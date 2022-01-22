import { Injectable } from '@angular/core';
import { Square } from '@app/classes/square';
import { Board } from '@app/classes/board';

@Injectable({
    providedIn: 'root',
})
export class ScoreCalculatorService {
    board: Board;

    // TODO: Potentially make an interface of a candidate word to make it clearer
    calculate(words: Square[][]): number {
        return 0;
    }
}
