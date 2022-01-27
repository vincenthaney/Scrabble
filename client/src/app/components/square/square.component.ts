import { Component, Input, OnInit } from '@angular/core';
import { DEFAULT_SQUARE_COLOR } from '@app/classes/game-constants';
import { Vec2 } from '@app/classes/vec2';
import { SquareView } from './square-view';

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit {
    @Input() squareView: SquareView;
    style = {};

    ngOnInit() {
        this.initializeColor();
    }

    getSquareSize(): Vec2 {
        return this.squareView.squareSize;
    }

    private initializeColor() {
        if (!this.squareView || !this.squareView.color) {
            this.style = {
                'background-color': DEFAULT_SQUARE_COLOR,
            };
            return;
        }
        this.style = {
            'background-color': this.squareView.color,
        };
    }
}
