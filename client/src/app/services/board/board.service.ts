import { EventEmitter, Injectable } from '@angular/core';
import { Square } from '@app/classes/square';

@Injectable({
    providedIn: 'root',
})
export default class BoardService {
    boardInitializationEvent: EventEmitter<Square[][]> = new EventEmitter();
    boardUpdateEvent: EventEmitter<Square[]> = new EventEmitter();

    initializeBoard(board: Square[][]) {
        this.boardInitializationEvent.emit(board);
    }
    updateBoard(squareUpdated: Square[]) {
        this.boardUpdateEvent.emit(squareUpdated);
    }
}
