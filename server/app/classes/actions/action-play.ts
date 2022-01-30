import Action from './action';

export default abstract class ActionPlay implements Action {
    willEndTurn(): boolean {
        return true;
    }

    abstract execute(): void;
    abstract getMessage(): string;
}
