import { Component, Input, OnInit } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { SquareView } from './square-view';

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent implements OnInit {
    @Input() squareView: SquareView;
    canvasContext: CanvasRenderingContext2D;
    style = {};

    ngOnInit() {
        this.style = {
            'background-color': this.squareView.color,
        };
    }
    getSquareSize(): Vec2 {
        return this.squareView.squareSize;
    }
}
