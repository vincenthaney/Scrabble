import ActionInfo from './action-info';

export default class ActionHelp extends ActionInfo {
    execute(): void {
        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
