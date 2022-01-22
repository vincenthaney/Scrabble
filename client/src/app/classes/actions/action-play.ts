import { Action } from '@app/classes/actions/action';

export abstract class ActionPlay implements Action {
    willEndTurn(): boolean {
        return true;
    }

    abstract execute(): void;
    abstract getMessage(): string;
}
