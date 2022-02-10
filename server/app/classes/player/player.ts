import { Tile } from '@app/classes/tile';

export default class Player {
    name: string;
    score: number;
    tiles: Tile[];
    private id: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.tiles = [];
    }

    getId() {
        return this.id;
    }

    getTileRackPoints(): number {
        return this.tiles.reduce((prev, next) => (prev += next.value), 0);
    }

    hasTilesLeft(): boolean {
        return this.tiles.length > 0;
    }
}
