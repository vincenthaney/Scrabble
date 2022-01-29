import { convertTime } from './utils';

describe('Util functions', () => {
    it('convertTime should output the correct string', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const TIMES = [0, 1, 2, 30, 60, 61, 90, 120, 121, 150, 243];
        const EXPECTED_STRINGS = [
            '',
            '1 seconde',
            '2 secondes',
            '30 secondes',
            '1 minute',
            '1 minute et 1 seconde',
            '1 minute et 30 secondes',
            '2 minutes',
            '2 minutes et 1 seconde',
            '2 minutes et 30 secondes',
            '4 minutes et 3 secondes',
        ];
        for (let i = 0; i < TIMES.length; i++) {
            expect(convertTime(TIMES[i])).toEqual(EXPECTED_STRINGS[i]);
        }
    });
});
