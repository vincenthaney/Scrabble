export class TestTimer {
    private start: number;
    private last: number;
    private index: number;

    constructor(private name: string, private indent: number = 0) {
        this.start = Date.now();
        this.last = this.start;
        this.index = 0;

        // eslint-disable-next-line no-console
        console.log(`${this.getIndent()}+>`, 'Start:', this.name);
    }

    next(step?: string) {
        const now = Date.now();

        // eslint-disable-next-line no-console
        console.log(`${this.getIndent()}+>`, `${this.name}${step ? ': ' + step : ''}`, this.index, now - this.start, now - this.last);

        this.last = now;
        this.index++;
    }

    private getIndent(): string {
        return new Array(this.indent * 2).fill(' ').join('');
    }
}
