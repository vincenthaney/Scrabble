import { Pipe, PipeTransform } from '@angular/core';
import { padStart } from 'lodash';

export interface DurationPipeParams {
    hours: boolean;
    minutes: boolean;
    seconds: boolean;
    padHours: boolean;
    padMinutes: boolean;
    padSeconds: boolean;
}

const DEFAULT_DURATION_PIPE_PARAMS: DurationPipeParams = {
    hours: true,
    minutes: true,
    seconds: false,
    padHours: false,
    padMinutes: true,
    padSeconds: true,
};

const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;

@Pipe({
    name: 'duration',
})
export class DurationPipe implements PipeTransform {
    private duration: number;
    private output: string;
    private parameters: DurationPipeParams;

    transform(duration: number, params: Partial<DurationPipeParams> = {}): string {
        this.duration = duration;
        this.output = '';
        this.parameters = { ...DEFAULT_DURATION_PIPE_PARAMS, ...params };

        if (this.parameters.hours) this.addDurationValue(SECONDS_IN_HOUR, this.parameters.padHours, 'h');
        if (this.parameters.minutes) this.addDurationValue(SECONDS_IN_MINUTE, this.parameters.padMinutes, 'm');
        if (this.parameters.seconds) this.addDurationValue(1, this.parameters.padSeconds, 's');

        if (this.output === '') this.output = '0s';

        return this.output;
    }

    private addDurationValue(factor: number, padNumber: boolean, suffix: string = '') {
        const value = Math.floor(this.duration / factor);

        if (value === 0) return;

        this.duration -= value * factor;

        this.output += (padNumber ? padStart(`${value}`, 2, '0') : `${value}`) + suffix;
    }
}
