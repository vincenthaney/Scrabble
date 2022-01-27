import { Injectable } from '@angular/core';
import { BoardService } from '@app/services';
// import { Square } from '@app/classes/square';

@Injectable({
    providedIn: 'root',
})
export default class ScoreComputerService {
    board: BoardService;

    // TODO: Potentially make an interface of a candidate word to make it clearer
    // computeScore(words: Square[][]): number {
    //     throw new Error('Method not implemented.');
    // }
}
