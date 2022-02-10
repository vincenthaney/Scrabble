import ActionPlay from '@app/classes/actions/action-play';
import { GameUpdateData } from '@app/classes/communication/game-update-data';

export default class ActionPass extends ActionPlay {
    // Doesn't have anything to do, but still extends Action
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    execute(): GameUpdateData | void {}

    getMessage(): string {
        return `${this.player.name} a passé son tour.`;
    }
}
