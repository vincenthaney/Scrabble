import { Component, Input } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { SquareView } from './square-view';

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent {
    @Input() squareView: SquareView;
    canvasContext: CanvasRenderingContext2D;

    getSquareSize(): Vec2 {
        return this.squareView.squareSize;
    }

    click() {
        // eslint-disable-next-line no-console
        console.log(this.squareView.id);
    }
}
