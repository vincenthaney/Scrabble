import { ActionPlay } from '@app/classes/actions/action-play';

export class ActionPass implements ActionPlay {
    isTurnEnding: boolean;

    constructor() {
        this.isTurnEnding = true;
    }

    execute(): void {
        return;
    }

    message(): string {
        return '';
    }
}
