export default abstract class Action {
    abstract willEndTurn(): boolean;
    // messageColor: number; // TODO: potentially make a color enum

    abstract execute(): void;
    abstract getMessage(): string;
}
