import { Component, Input } from '@angular/core';
import { Tile } from '@app/classes/tile';
import { UNDEFINED_TILE } from '@app/constants/game';

@Component({
    selector: 'app-tile',
    templateUrl: './tile.component.html',
    styleUrls: ['./tile.component.scss'],
})
export class TileComponent {
    @Input() tile: Tile;
    isPlayed: boolean = false;

    getTile() {
        if (!this.tile) {
            return UNDEFINED_TILE;
        }
        return this.tile;
    }
}
