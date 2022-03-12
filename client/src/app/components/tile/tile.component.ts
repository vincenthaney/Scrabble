import { Component, Input, OnInit } from '@angular/core';
import { LetterValue, Tile } from '@app/classes/tile';
import { UNDEFINED_TILE } from '@app/constants/game';

const AMOUNT_OF_TILE_BACKGROUND_IMG = 4;

@Component({
    selector: 'app-tile',
    templateUrl: './tile.component.html',
    styleUrls: ['./tile.component.scss'],
})
export class TileComponent implements OnInit {
    @Input() tile: Tile | { letter: '?'; value: number; isBlank?: boolean; playedLetter?: LetterValue } = UNDEFINED_TILE;
    @Input() fontSize: string = '1em';
    @Input() hideValue: boolean = false;
    @Input() applied: boolean = true;
    isPlayed: boolean = false;
    bgPath: string;

    constructor() {
        this.bgPath = this.getBgPath();
    }

    ngOnInit(): void {
        if (this.isWorthlessTile()) {
            this.hideValue = true;
        }
    }

    getBgPath(): string {
        const index = Math.floor(Math.random() * AMOUNT_OF_TILE_BACKGROUND_IMG) + 1;
        return `assets/img/tiles/bg_${index}.svg`;
    }

    private isWorthlessTile(): boolean {
        return this.tile.isBlank || (this.tile.letter === '*' && this.tile.value === 0);
    }
}
