import { Component } from '@angular/core';
import { COLORS } from '@app/classes/color-constants';
import { TileComponent } from '@app/components/tile/tile.component';

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.scss'],
})
export class SquareComponent {
    tile: TileComponent | null = null;
    color: COLORS = COLORS.Beige;
}
