import { ActionInfo } from '@app/classes/actions/action-info';

export class ActionHelp implements ActionInfo {
    isTurnEnding: boolean;

    constructor() {
        this.isTurnEnding = false;
    }

    execute(): void {
        return;
    }

    message(): string {
        return '';
    }
}
