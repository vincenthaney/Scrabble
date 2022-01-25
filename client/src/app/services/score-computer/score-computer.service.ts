import { Injectable } from '@angular/core';
// import { Square } from '@app/classes/square';
import { Board } from '@app/classes/board';

@Injectable({
    providedIn: 'root',
})
export default class ScoreComputerService {
    board: Board;

    // TODO: Potentially make an interface of a candidate word to make it clearer
    // computeScore(words: Square[][]): number {
    //     throw new Error('Method not implemented.');
    // }
}
