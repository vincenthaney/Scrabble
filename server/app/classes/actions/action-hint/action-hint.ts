import ActionInfo from '@app/classes/actions/action-info';
import { GameUpdateData } from '@app/classes/communication/game-update-data';

export default class ActionHint extends ActionInfo {
    execute(): GameUpdateData | void {
        // TODO: find words and send message only to current player
        throw new Error('Method not implemented.');
    }

    getMessage(): string | undefined {
        return undefined;
    }
}
