import { Component, Input, OnInit } from '@angular/core';
import { SquareView } from '@app/classes/square';
import { LetterValue } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { UNDEFINED_SQUARE_SIZE } from '@app/constants/game';

export interface CssStyleProperty {
    key: string;
    value: string;
}

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit {
    @Input() squareView: SquareView;
    style: { [key: string]: string } = {};
    multiplierType: string | undefined;
    multiplierValue: string | undefined;

    ngOnInit() {
        this.setText();
        this.initializeStyle();

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (Math.floor(Math.random() * 10) === 0) {
            const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            this.squareView.square.tile = { letter: ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length)) as LetterValue, value: 1 };
        }
    }

    getSquareSize(): Vec2 {
        if (!this.squareView) {
            return UNDEFINED_SQUARE_SIZE;
        }
        return this.squareView.squareSize;
    }

    setText() {
        // if (!this.squareView) {
        //     return UNDEFINED_TILE.letter;
        // }
        [this.multiplierType, this.multiplierValue] = this.squareView.getText();
    }

    private initializeStyle() {
        this.style = {
            'background-color': this.squareView.getColor(),
        };
    }
}
