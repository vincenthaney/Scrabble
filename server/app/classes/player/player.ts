import { Tile } from '@app/classes/tile';

export default class Player {
    name: string;
    score: number;
    tiles: Tile[];

    constructor(name: string) {
        this.name = name;
        this.score = 0;
        this.tiles = [];
    }
}
