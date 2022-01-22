import { ActionPlay } from '@app/classes/actions/action-play';

export class ActionPass implements ActionPlay {
    willEndTurn: boolean;

    constructor() {
        this.willEndTurn = true;
    }

    execute(): void {
        return;
    }

    getMessage(): string {
        return '';
    }
}
