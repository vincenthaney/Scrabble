import { Injectable } from '@angular/core';
import { Square } from '@app/classes/square';
import { Board } from '@app/classes/board';

@Injectable({
    providedIn: 'root',
})
export class ScoreCalculatorService {
    // TODO: Potentially make an interface of a candidate word to make it clearer
    calculate(board: Board, squaresPlaced: Square[]): Square[][] {
        return [...Array(0)].map(() => Array(0));
    }
}
