import ActionPlay from './action-play';
import { Tile } from '@app/classes/tile';

export default class ActionExchange extends ActionPlay {
    tilesToExchange: Tile[];

    constructor(tilesToExchange: Tile[]) {
        super();
        this.tilesToExchange = tilesToExchange;
    }

    execute(): void {
        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
