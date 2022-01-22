export default interface Action {
    willEndTurn(): boolean;
    // messageColor: number; // TODO: potentially make a color enum

    execute(): void;
    getMessage(): string;
}
