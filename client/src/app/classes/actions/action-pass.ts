import { ActionPlay } from '@app/classes/actions';

export default class ActionPass extends ActionPlay {
    execute(): void {
        return;
    }

    getMessage(): string {
        return '';
    }
}
