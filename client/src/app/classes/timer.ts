export class Timer {
    minutes: number;
    seconds: number;

    constructor(minutes: number, seconds: number) {
        this.minutes = minutes;
        this.seconds = seconds;
    }
    decrement(): void {
        if (this.seconds > 0) {
            this.seconds--;
        } else {
            this.minutes--;
            this.seconds = 60;
        }
    }

    getTimerSecondsPadded(): string {
        return this.seconds.toString().padStart(2, '0');
    }
}
