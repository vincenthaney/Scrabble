import { Injectable } from '@angular/core';
import { BOARD_SIZE } from '@app/classes/game-constants';
import { Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export default class BoardService {
    private static readonly size: Vec2 = { x: BOARD_SIZE.x, y: BOARD_SIZE.y };
    grid: Square[][];

    constructor() {
        this.initializeBoardGrid();
    }

    getGridSize(): Vec2 {
        if (!this.grid || !this.grid[0]) {
            return { x: 0, y: 0 };
        }
        const x = this.grid.length;
        const y = this.grid[0].length;
        return { x, y };
    }

    private initializeBoardGrid() {
        for (let i = 0; i < BoardService.size.y; i++) {
            this.grid[i] = [];
            for (let j = 0; j < BoardService.size.x; j++) {
                const square = {
                    tile: null,
                    letterMultiplier: 1,
                    wordMultiplier: 1,
                    isMultiplierPlayed: false,
                };
                this.grid[i][j] = square;
            }
        }
    }
    // private placeTile(position: Position, tile: Tile): boolean {
    //     throw new Error('Method not implemented.');
    // } // Verify if there is already a tile in that square
    // private removePlayedTiles(): void {
    //     throw new Error('Method not implemented.');
    // }
}
