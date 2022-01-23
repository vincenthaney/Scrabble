import { Component } from '@angular/core';
import { Board } from '@app/classes/board';
import { COLORS } from '@app/classes/color-constants';
import { SquareComponent } from '@app/components/square/square.component';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
    squares: SquareComponent[][];

    constructor() {
        this.squares = [];
        for (let i = 0; i < Board.size.x; i++) {
            this.squares[i] = [];
            for (let j = 0; j < Board.size.y; j++) {
                this.squares[i][j] = new SquareComponent(null, COLORS.Beige);
            }
        }
    }
}
