import { Pipe, PipeTransform } from '@angular/core';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { padStart, take } from 'lodash';
import { pipe } from 'rxjs';

export type DurationTime = [time: number, suffix: string];

const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;
const MAX_ITEMS = 2;

@Pipe({
    name: 'duration',
})
export class DurationPipe implements PipeTransform {
    private duration: number;

    transform(duration: number): string {
        this.duration = duration;
        return pipe(this.trimDurationTimes, this.mapToString, this.merge)(this.getDurationTimes());
    }

    private trimDurationTimes(durationsTimes: DurationTime[]) {
        durationsTimes = [...durationsTimes];
        while (durationsTimes.length > 0 && durationsTimes[0][0] === 0) durationsTimes.shift();
        while (durationsTimes.length > 0 && durationsTimes[durationsTimes.length - 1][0] === 0) durationsTimes.pop();
        return take(durationsTimes, MAX_ITEMS);
    }

    private mapToString(durationsTimes: DurationTime[]): string[] {
        return durationsTimes.map(([time, suffix], index) => `${index > 0 ? padStart(time.toString(), 2, '0') : time}${suffix}`);
    }

    private merge(timeString: string[]): string {
        return timeString.join(' ');
    }

    private getDurationTimes(): DurationTime[] {
        return [
            [this.getTime(SECONDS_IN_HOUR * SECONDS_TO_MILLISECONDS), 'h'],
            [this.getTime(SECONDS_IN_MINUTE * SECONDS_TO_MILLISECONDS), 'm'],
            [this.getTime(SECONDS_TO_MILLISECONDS), 's'],
        ];
    }

    private getTime(factor: number): number {
        const time = Math.floor(this.duration / factor);
        this.duration -= time * factor;
        return time;
    }
}
