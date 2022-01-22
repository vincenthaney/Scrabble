import { Action } from '@app/classes/actions/action';

export interface ActionInfo extends Action {
    isTurnEnding: boolean;

    execute(): void;
    message(): string;
}
