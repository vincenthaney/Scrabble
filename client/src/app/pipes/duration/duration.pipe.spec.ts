/* eslint-disable @typescript-eslint/no-magic-numbers */
import { DurationPipe, DurationPipeParams } from './duration.pipe';

describe('DurationPipe', () => {
    it('create an instance', () => {
        const pipe = new DurationPipe();
        expect(pipe).toBeTruthy();
    });

    const tests: [duration: number, parameters: Partial<DurationPipeParams>, expected: string][] = [
        [0, {}, '0s'],
        [10, { hours: false, minutes: false, seconds: true }, '10s'],
        [60, { minutes: true, padMinutes: false }, '1m'],
        [3600, { hours: true }, '1h'],
        [3720, { hours: true, minutes: true, seconds: false, padMinutes: true }, '1h02m'],
        [3720, { hours: true, minutes: true, seconds: false, padMinutes: false }, '1h2m'],
    ];

    let index = 1;
    for (const [duration, parameters, expected] of tests) {
        it(`should convert duration (${index})`, () => {
            const pipe = new DurationPipe();
            expect(pipe.transform(duration, parameters)).toEqual(expected);
        });
        index++;
    }

    it('should work with empty parameters', () => {
        const pipe = new DurationPipe();
        expect(pipe.transform(0)).toBeTruthy();
    });

    it('should work without suffix', () => {
        const pipe = new DurationPipe();
        // eslint-disable-next-line dot-notation
        expect(pipe['addDurationValue'](1, false)).toBeTruthy();
    });
});
