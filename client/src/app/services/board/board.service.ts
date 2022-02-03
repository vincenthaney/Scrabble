import { EventEmitter, Injectable } from '@angular/core';
import { Square } from '@app/classes/square';
// import { Square } from '@app/classes/square';
// import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export default class BoardService {
    boardUpdateEvent: EventEmitter<Square[]> = new EventEmitter();
    // public setAbstractBoard(abstractBoard: Square[][]) {
    //     throw new Error('Method not implemented.');
    // }

    updateBoard(board: Square[]) {
        this.boardUpdateEvent.emit(board);
    }
}
