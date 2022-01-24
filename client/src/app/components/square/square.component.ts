import { Component, Input } from '@angular/core';
import { COLORS } from '@app/classes/color-constants';
import { SQUARE_SIZE } from '@app/classes/game-constants';
import { Vec2 } from '@app/classes/vec2';
import { TileComponent } from '@app/components/tile/tile.component';

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent {
    private static squareSize: Vec2 = SQUARE_SIZE;

    @Input() squarePosition: Vec2;
    @Input() tile: TileComponent | null;
    @Input() color: COLORS = COLORS.Beige;
    canvasContext: CanvasRenderingContext2D;

    static getSquareSize(): Vec2 {
        return SquareComponent.squareSize;
    }
}
