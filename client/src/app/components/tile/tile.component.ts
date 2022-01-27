import { Component, Input } from '@angular/core';
import { UNDEFINED_LETTER, UNDEFINED_LETTER_VALUE } from '@app/classes/game-constants';
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
            return {
                letter: UNDEFINED_LETTER,
                value: UNDEFINED_LETTER_VALUE,
            };
        }
        return this.tile;
    }
}
