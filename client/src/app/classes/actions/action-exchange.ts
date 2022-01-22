import { ActionPlay } from '@app/classes/actions';
import { Tile } from '@app/classes/tile';

export default class ActionExchange extends ActionPlay {
    tilesToExchange: Tile[];

    constructor(tilesToExchange: Tile[]) {
        super();
        this.tilesToExchange = tilesToExchange;
    }

    execute(): void {
        return;
    }

    getMessage(): string {
        return '';
    }
}
