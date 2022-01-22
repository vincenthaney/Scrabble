import { Action } from '@app/classes/actions/action';

export interface ActionPlay extends Action {
    isTurnEnding: boolean;

    execute(): void;
    message(): string;
}
