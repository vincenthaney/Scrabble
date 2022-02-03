import { Square } from '@app/classes/square/';

export default class Board {
    grid: Square[][];

    constructor(grid: Square[][]) {
        this.grid = grid;
    }
}
