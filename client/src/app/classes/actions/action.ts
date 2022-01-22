export interface Action {
    isTurnEnding: boolean;
    // messageColor: number; // TODO: potentially make a color enum

    execute(): void;
    message(): string;
}
