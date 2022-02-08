/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Timer } from './timer';
import { convertTime } from './utils';

describe('Util functions', () => {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const TIMES = [0, 1, 2, 30, 60, 61, 90, 120, 121, 150, 243];
    const EXPECTED_TIMERS: Timer[] = [
        new Timer(0, 0),
        new Timer(0, 1),
        new Timer(0, 2),
        new Timer(0, 30),
        new Timer(1, 0),
        new Timer(1, 1),
        new Timer(1, 30),
        new Timer(2, 0),
        new Timer(2, 1),
        new Timer(2, 30),
        new Timer(4, 3),
    ];

    for (let i = 0; i < TIMES.length; i++) {
        it(`convertTime should output the correct string (${TIMES[i]})`, () => {
            expect(convertTime(TIMES[i])).toEqual(EXPECTED_TIMERS[i]);
        });
    }
});
