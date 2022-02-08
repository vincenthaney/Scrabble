import { convertTime } from './utils';

describe('Util functions', () => {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const TIMES = [0, 1, 2, 30, 60, 61, 90, 120, 121, 150, 243];
    const EXPECTED_STRINGS = [
        { minutes: 0, seconds: 0 },
        { minutes: 0, seconds: 1 },
        { minutes: 0, seconds: 2 },
        { minutes: 0, seconds: 30 },
        { minutes: 1, seconds: 0 },
        { minutes: 1, seconds: 1 },
        { minutes: 1, seconds: 30 },
        { minutes: 2, seconds: 0 },
        { minutes: 2, seconds: 1 },
        { minutes: 2, seconds: 30 },
        { minutes: 4, seconds: 3 },
    ];

    for (let i = 0; i < TIMES.length; i++) {
        it(`convertTime should output the correct string (${TIMES[i]})`, () => {
            expect(convertTime(TIMES[i])).toEqual(EXPECTED_STRINGS[i]);
        });
    }
});
