/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
    it('create an instance', () => {
        const pipe = new DurationPipe();
        expect(pipe).toBeTruthy();
    });

    const tests: [duration: number, expected: string][] = [
        [0, '0m'],
        [60, '1m'],
        [3600, '1h'],
        [3720, '1h 02m'],
    ];

    let index = 1;
    for (const [duration, expected] of tests) {
        it(`should convert duration (${index})`, () => {
            const pipe = new DurationPipe();
            expect(pipe.transform(duration)).toEqual(expected);
        });
        index++;
    }

    it('should work with empty parameters', () => {
        const pipe = new DurationPipe();
        expect(pipe.transform(0)).toBeTruthy();
    });
});
