import { Injectable } from '@angular/core';
import { Square } from '@app/classes/square';
import { Board } from '@app/classes/board';

@Injectable({
    providedIn: 'root',
})
export class WordExtractionService {
    // TODO: Potentially make an interface of a candidate word to make it clearer
    extract(board: Board, squaresPlaced: Square[]): Square[][] {
        throw new Error('Method not implemented.');
    }
}
