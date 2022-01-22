import { ActionPlay } from '@app/classes/actions';
import { Tile } from '@app/classes/tile';

export default class ActionExchange extends ActionPlay {
    tilesToExchange: Tile[];

    constructor(tilesToExchange: Tile[]) {
        super();
        this.tilesToExchange = tilesToExchange;
        throw new Error('Method not implemented.');
    }

    execute(): void {
        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
