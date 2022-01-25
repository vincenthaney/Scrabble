import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Board } from '@app/classes/board';
import { COLORS } from '@app/classes/color-constants';
import { BOARD_SIZE, SQUARE_SIZE } from '@app/classes/game-constants';
import { SquareView } from '@app/components/square/square-view';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, AfterViewInit {
    @ViewChild('board') componentIdentifier: ElementRef;

    readonly marginColumnSize: number = 0;
    squares: SquareView[][];
    colAmount: number = 0;
    boardStyle: BoardStyle = {
        width: '100%',
    };
    ngOnInit() {
        this.squares = [];
        for (let i = 0; i < Board.size.x; i++) {
            this.squares[i] = [];
            for (let j = 0; j < Board.size.y; j++) {
                const square: SquareView = {
                    square: null,
                    squareSize: SQUARE_SIZE,
                    squarePosition: { x: i, y: j },
                    color: COLORS.Beige,
                    id: Math.floor(Math.random() * 1000),
                };
                this.squares[i][j] = square;
            }
        }
        this.colAmount = BOARD_SIZE.x + 2 * this.marginColumnSize;
        this.boardStyle.width = '50%';
    }

    ngAfterViewInit(): void {
        // this.resizeToSquare();
        const board = document.getElementById('board');
        if (board) {
            const boardHeight = board.offsetHeight;
            this.boardStyle.width = String(boardHeight + 'px');
        }
    }

    resizeToSquare(): void {
        const board: HTMLElement = this.componentIdentifier.nativeElement;

        const boardHeight = board.offsetHeight;
        this.boardStyle.width = String(boardHeight + 'px');
        console.log(board.style.width);
        // if (board) {

        //     // eslint-disable-next-line no-console
        //     console.log(this.boardStyle.width);
        // }
    }
}

interface BoardStyle {
    width: string;
}
