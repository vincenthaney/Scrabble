import { ActionInfo } from '@app/classes/actions';

export default class ActionClue extends ActionInfo {
    execute(): void {
        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
