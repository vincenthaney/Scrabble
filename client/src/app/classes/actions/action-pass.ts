import { ActionPlay } from '@app/classes/actions/action-play';

export class ActionPass extends ActionPlay {
    execute(): void {
        return;
    }

    getMessage(): string {
        return '';
    }
}
