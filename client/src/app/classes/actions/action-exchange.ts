import { ActionPlay } from '@app/classes/actions/action-play';
import { Tile } from '@app/classes/tile';

export class ActionExchange extends ActionPlay {
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
