import { Injectable } from '@angular/core';
import { Square } from '@app/classes/square';
// import { Square } from '@app/classes/square';
// import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export default class BoardService {
    private abstractBoard: Square[][];
    // public setAbstractBoard(abstractBoard: Square[][]) {
    //     throw new Error('Method not implemented.');
    // }

    sendBoardToComponent(): Square[][] {
        return this.abstractBoard;
    }
}
