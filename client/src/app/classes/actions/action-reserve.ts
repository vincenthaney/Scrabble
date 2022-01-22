import { ActionInfo } from '@app/classes/actions/action-info';

export class ActionReserve implements ActionInfo {
    willEndTurn: boolean;

    constructor() {
        this.willEndTurn = false;
    }

    execute(): void {
        return;
    }

    getMessage(): string {
        return '';
    }
}
