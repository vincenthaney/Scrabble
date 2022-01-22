import { Action } from '@app/classes/actions/action';

export interface ActionInfo extends Action {
    willEndTurn: boolean;

    execute(): void;
    getMessage(): string;
}
