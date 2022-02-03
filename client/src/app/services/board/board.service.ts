import { EventEmitter, Injectable } from '@angular/core';
import { Square } from '@app/classes/square';
// import { Square } from '@app/classes/square';
// import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export default class BoardService {
    boardInitializationEvent: EventEmitter<Square[][]> = new EventEmitter();
    boardUpdateEvent: EventEmitter<Square[]> = new EventEmitter();
    // public setAbstractBoard(abstractBoard: Square[][]) {
    //     throw new Error('Method not implemented.');
    // }

    initializeBoard(board: Square[][]) {
        this.boardInitializationEvent.emit(board);
    }
    updateBoard(squareUpdated: Square[]) {
        this.boardUpdateEvent.emit(squareUpdated);
    }
}
