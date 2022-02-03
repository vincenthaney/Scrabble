import { Component, QueryList, ViewChildren } from '@angular/core';
import { Square, SquareView } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { SquareComponent } from '@app/components/square/square.component';
import { LETTER_VALUES, MARGIN_COLUMN_SIZE, SQUARE_SIZE, TILE_MAX_FONT_SIZE, TILE_MIN_FONT_SIZE, UNDEFINED_SQUARE } from '@app/constants/game';
import { BoardService } from '@app/services/';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent {
    @ViewChildren('square') squareComponents: QueryList<SquareComponent>;

    marginLetters: LetterValue[];
    readonly marginColumnSize: number;
    gridSize: Vec2;
    squareGrid: SquareView[][];

    constructor(private boardService: BoardService) {
        this.marginColumnSize = MARGIN_COLUMN_SIZE;
        this.initializeBoard(); // To remove
        this.marginLetters = LETTER_VALUES.slice(0, this.gridSize.x);
    }

    changeFontSize(operation: string) {
        if (operation === 'smaller') {
            this.squareComponents.forEach((squareComponent) => {
                if (squareComponent.fontSize > TILE_MIN_FONT_SIZE) squareComponent.fontSize -= 0.1;
            });
        } else if (operation === 'larger') {
            this.squareComponents.forEach((squareComponent) => {
                if (squareComponent.fontSize < TILE_MAX_FONT_SIZE) squareComponent.fontSize += 0.1;
            });
        }
    }

    private initializeBoard() {
        const abstractBoard: Square[][] = this.boardService.sendBoardToComponent();
        if (!abstractBoard || !abstractBoard[0]) {
            this.gridSize = { x: 0, y: 0 };
            return;
        }

        this.gridSize = { x: abstractBoard.length, y: abstractBoard[0].length };
        this.squareGrid = [];
        for (let i = 0; i < this.gridSize.y; i++) {
            this.squareGrid[i] = [];
            for (let j = 0; j < this.gridSize.x; j++) {
                const square: Square = this.getBoardServiceSquare(abstractBoard, i, j);
                const squareView: SquareView = new SquareView(square, SQUARE_SIZE);
                this.squareGrid[i][j] = squareView;
            }
        }
    }

    private getBoardServiceSquare(abstractBoard: Square[][], row: number, column: number) {
        return abstractBoard[row] && abstractBoard[row][column] ? abstractBoard[row][column] : UNDEFINED_SQUARE;
    }
}
