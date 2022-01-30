import Action from './action';

export default abstract class ActionInfo implements Action {
    willEndTurn(): boolean {
        return false;
    }

    abstract execute(): void;
    abstract getMessage(): string;
}
