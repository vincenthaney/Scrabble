import { Component, Input, OnInit } from '@angular/core';
import { Orientation } from '@app/classes/orientation';
import { SquareView } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { UNDEFINED_SQUARE_SIZE } from '@app/constants/game';
import { SQUARE_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size';

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
    @Input() tileFontSize: number = SQUARE_TILE_DEFAULT_FONT_SIZE;
    @Input() isCursor: boolean = false;
    @Input() cursorOrientation: Orientation = Orientation.Horizontal;
    style: { [key: string]: string } = {};
    multiplierType: string | undefined;
    multiplierValue: string | undefined;

    ngOnInit(): void {
        this.setText();
        this.initializeStyle();
    }

    getSquareSize(): Vec2 {
        return this.squareView ? this.squareView.squareSize : UNDEFINED_SQUARE_SIZE;
    }

    setText(): void {
        [this.multiplierType, this.multiplierValue] = this.squareView.getText();
    }

    getOrientationClass(): string {
        return `cursor-${this.cursorOrientation === Orientation.Horizontal ? 'horizontal' : 'vertical'}`;
    }

    private initializeStyle(): void {
        this.style = {
            'background-color': this.squareView.getColor(),
        };
    }
}
