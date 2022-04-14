import ActionPlay from '@app/classes/actions/action-play';
import { ActionData, ActionType } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { FeedbackMessage } from '@app/services/game-play-service/feedback-messages';

export default class ActionPass extends ActionPlay {
    static createActionData(): ActionData {
        return {
            input: '',
            type: ActionType.PASS,
            payload: {},
        };
    }

    execute(): GameUpdateData | void {
        return;
    }

    getMessage(): FeedbackMessage {
        return { message: 'Vous avez passé votre tour' };
    }

    getOpponentMessage(): FeedbackMessage {
        return { message: `${this.player.name} a passé son tour` };
    }
}
