import { Component, Input, OnInit } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_SQUARE_COLOR } from '@app/constants/game';
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
        this.style =
            this.squareView && this.squareView.color
                ? {
                      'background-color': this.squareView.color,
                  }
                : {
                      'background-color': DEFAULT_SQUARE_COLOR,
                  };
    }
}
