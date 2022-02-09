export class Timer {
    minutes: number;
    seconds: number;

    constructor(minutes: number, seconds: number) {
        if (minutes < 0 || seconds < 0) throw new Error(ILLEGAL_TIMER_PARAMETERS);
        this.minutes = minutes;
        this.seconds = seconds;
    }
    decrement(): void {
        if (this.seconds > 0) {
            this.seconds--;
        } else if (this.minutes > 0) {
            this.minutes--;
            this.seconds = 59;
        }
    }

    getTimerSecondsPadded(): string {
        return this.seconds.toString().padStart(2, '0');
    }
}

export const ILLEGAL_TIMER_PARAMETERS = 'The arguments passed to create the timer are not valid (minute < 0 or seconds < 0)';
