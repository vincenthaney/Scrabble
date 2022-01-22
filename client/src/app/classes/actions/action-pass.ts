import { ActionPlay } from '@app/classes/actions';

export default class ActionPass extends ActionPlay {
    execute(): void {
        throw new Error('Method not implemented.');
    }

    getMessage(): string {
        throw new Error('Method not implemented.');
    }
}
