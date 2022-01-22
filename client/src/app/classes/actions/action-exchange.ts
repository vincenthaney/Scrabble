import { ActionPlay } from '@app/classes/actions/action-play';
import { Tile } from '@app/classes/tile';

export class ActionExchange implements ActionPlay {
    willEndTurn: boolean;
    tilesToExchange: Tile[];

    constructor(tilesToExchange: Tile[]) {
        this.willEndTurn = true;
        this.tilesToExchange = tilesToExchange;
    }

    execute(): void {
        return;
    }

    getMessage(): string {
        return '';
    }
}
