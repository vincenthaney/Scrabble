import { Component, Input } from '@angular/core';
import { Tile } from '@app/classes/tile';
import { UNDEFINED_TILE } from '@app/constants/game';

const AMOUNT_OF_TILE_BACKGROUND_IMG = 4;

@Component({
    selector: 'app-tile',
    templateUrl: './tile.component.html',
    styleUrls: ['./tile.component.scss'],
})
export class TileComponent {
    @Input() tile: Tile | { letter: '?'; value: number } = UNDEFINED_TILE;
    @Input() fontSize: string = '1em';
    @Input() hideValue: boolean = false;
    isPlayed: boolean = false;
    bgPath: string;

    constructor() {
        this.bgPath = this.getBgPath();
    }

    getBgPath(): string {
        const index = Math.floor(Math.random() * AMOUNT_OF_TILE_BACKGROUND_IMG) + 1;
        return `/assets/img/tiles/bg_${index}.svg`;
    }
}
