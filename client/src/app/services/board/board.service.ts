import { EventEmitter, Injectable } from '@angular/core';
import { Square } from '@app/classes/square';

@Injectable({
    providedIn: 'root',
})
export default class BoardService {
    boardInitializationEvent: EventEmitter<Square[][]> = new EventEmitter();
    boardUpdateEvent: EventEmitter<Square[]> = new EventEmitter();
    private initialBoard: Square[][];

    initializeBoard(board: Square[][]): void {
        this.initialBoard = [...board];
        this.boardInitializationEvent.emit(this.initialBoard);
    }

    updateBoard(squareUpdated: Square[]): void {
        this.boardUpdateEvent.emit(squareUpdated);
    }

    readInitialBoard(): Square[][] {
        return [...this.initialBoard];
    }
}
