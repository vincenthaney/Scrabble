import ActionInfo from '@app/classes/actions/action-info';
import { HELP_ACTIONS } from './action-help-const';

export default class ActionHelp extends ActionInfo {
    getMessage(): string {
        return HELP_ACTIONS.map((action) => `!${action.command}${action.usage ? ' ' + action.usage : ''}: ${action.description}`).join('\n');
    }

    getOpponentMessage(): string | undefined {
        return undefined;
    }
}
