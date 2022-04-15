import ActionInfo from '@app/classes/actions/action-info';
import { HELP_ACTIONS } from '@app/constants/classes-constants';
import { FeedbackMessage } from '@app/services/game-play-service/feedback-messages';

export default class ActionHelp extends ActionInfo {
    getMessage(): FeedbackMessage {
        return {
            message: HELP_ACTIONS.map((action) => `!**${action.command}**${action.useCase ? ' ' + action.useCase : ''}: ${action.description}`).join(
                '<br>',
            ),
        };
    }

    getOpponentMessage(): FeedbackMessage {
        return {};
    }
}
