import ActionInfo from '@app/classes/actions/action-info';
import { HELP_ACTIONS } from '@app/constants/classes-constants';

export default class ActionHelp extends ActionInfo {
    getMessage(): string {
        return HELP_ACTIONS.map((action) => `!${action.command}${action.useCase ? ' ' + action.useCase : ''}: ${action.description}`).join('\n');
    }

    getOpponentMessage(): string | undefined {
        return undefined;
    }
}
