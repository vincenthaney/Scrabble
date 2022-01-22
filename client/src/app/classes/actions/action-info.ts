import { Action } from '@app/classes/actions/action';

export abstract class ActionInfo implements Action {
    willEndTurn(): boolean {
        return false;
    }

    abstract execute(): void;
    abstract getMessage(): string;
}
