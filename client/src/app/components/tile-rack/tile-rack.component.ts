import { Component } from '@angular/core';
import { TileComponent } from '@app/components/tile/tile.component';

@Component({
    selector: 'app-tile-rack',
    templateUrl: './tile-rack.component.html',
    styleUrls: ['./tile-rack.component.scss'],
})
export class TileRackComponent {
    tiles: TileComponent[];
}
