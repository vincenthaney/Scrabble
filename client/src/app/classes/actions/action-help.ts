import { ActionInfo } from '@app/classes/actions';

export default class ActionHelp extends ActionInfo {
    execute(): void {
        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
