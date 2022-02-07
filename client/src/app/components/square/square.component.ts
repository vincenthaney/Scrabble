import { Component, Input, OnInit } from '@angular/core';
import { SquareView } from '@app/classes/square';
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
    }

    getSquareSize(): Vec2 {
        if (!this.squareView) {
            return UNDEFINED_SQUARE_SIZE;
        }
        return this.squareView.squareSize;
    }

    setText() {
        [this.multiplierType, this.multiplierValue] = this.squareView.getText();
    }

    private initializeStyle() {
        this.style = {
            'background-color': this.squareView.getColor(),
        };
    }
}
