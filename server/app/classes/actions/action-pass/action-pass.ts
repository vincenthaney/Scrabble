import ActionPlay from '@app/classes/actions/action-play';
import { ActionData, ActionType } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';

export default class ActionPass extends ActionPlay {
    static createActionData(): ActionData {
        return {
            input: '',
            type: ActionType.PASS,
            payload: {
                tiles: [],
            },
        };
    }

    execute(): GameUpdateData | void {
        return;
    }

    getMessage(): string {
        return 'Vous avez passé votre tour';
    }

    getOpponentMessage(): string | undefined {
        return `${this.player.name} a passé son tour`;
    }
}
