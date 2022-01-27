import { Component, Input } from '@angular/core';
import { UNDEFINED_TILE } from '@app/classes/game-constants';
import { Tile } from '@app/classes/tile';

@Component({
    selector: 'app-tile',
    templateUrl: './tile.component.html',
    styleUrls: ['./tile.component.scss'],
})
export class TileComponent {
    @Input() private tile: Tile;
    isPlayed: boolean = false;

    getTile() {
        if (!this.tile) {
            return UNDEFINED_TILE;
        }
        return this.tile;
    }
}
