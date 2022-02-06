export class WordError extends Error {
    word: string;
    constructor(message: string, word: string) {
        super(message);
        this.word = word;
    }
}
