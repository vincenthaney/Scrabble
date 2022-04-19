import { Pipe, PipeTransform } from '@angular/core';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game-constants';
import { padStart, take } from 'lodash';
import { pipe } from 'rxjs';

export type DurationTime = [time: number, suffix: string, noPad?: boolean];

const SECONDS_IN_DAY = 86400;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;
const MIN_ITEMS = 1;
const MAX_ITEMS = 2;

@Pipe({
    name: 'duration',
})
export class DurationPipe implements PipeTransform {
    private duration: number;

    transform(duration: number): string {
        this.duration = duration;
        return pipe(this.trimDurationTimes, this.takeMaxItems, this.trimDurationTimes, this.mapToString, this.join)(this.getDurationTimes());
    }

    private trimDurationTimes(durationsTimes: DurationTime[]): DurationTime[] {
        durationsTimes = [...durationsTimes];
        while (durationsTimes.length > MIN_ITEMS && durationsTimes[0][0] === 0) durationsTimes.shift();
        while (durationsTimes.length > MIN_ITEMS && durationsTimes[durationsTimes.length - 1][0] === 0) durationsTimes.pop();
        return durationsTimes;
    }

    private takeMaxItems(durationsTimes: DurationTime[]): DurationTime[] {
        return take(durationsTimes, MAX_ITEMS);
    }

    private mapToString(durationsTimes: DurationTime[]): string[] {
        return durationsTimes.map(([time, suffix, noPad], index) => `${index > 0 && !noPad ? padStart(time.toString(), 2, '0') : time}${suffix}`);
    }

    private join(timeString: string[]): string {
        return timeString.join(' ');
    }

    private getDurationTimes(): DurationTime[] {
        return [
            [this.getRemainingTime(SECONDS_IN_DAY * SECONDS_TO_MILLISECONDS), ' jour(s)', true],
            [this.getRemainingTime(SECONDS_IN_HOUR * SECONDS_TO_MILLISECONDS), 'h', true],
            [this.getRemainingTime(SECONDS_IN_MINUTE * SECONDS_TO_MILLISECONDS), 'm'],
            [this.getRemainingTime(SECONDS_TO_MILLISECONDS), 's'],
            [this.getRemainingTime(1), 'ms'],
        ];
    }

    private getRemainingTime(factor: number): number {
        const time = Math.floor(this.duration / factor);
        this.duration -= time * factor;
        return time;
    }
}
