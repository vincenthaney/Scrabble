import { EventEmitter, Injectable } from '@angular/core';
import { Square } from '@app/classes/square';

@Injectable({
    providedIn: 'root',
})
export default class BoardService {
    initialBoard: Square[][] = [];
    boardInitializationEvent: EventEmitter<Square[][]> = new EventEmitter();
    boardUpdateEvent: EventEmitter<Square[]> = new EventEmitter();

    initializeBoard(board: Square[][]): void {
        this.initialBoard = [...board];
        this.boardInitializationEvent.emit(this.initialBoard);
    }

    updateBoard(squareUpdated: Square[]): void {
        this.boardUpdateEvent.emit(squareUpdated);
    }
}
