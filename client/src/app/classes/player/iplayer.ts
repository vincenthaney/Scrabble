import { Tile } from '@app/classes/tile';
export default abstract class IPlayer {
    name: string;
    score: number;
    tiles: Tile[];

    constructor(name: string) {
        this.name = name;
        this.score = 0;
    }
}
