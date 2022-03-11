import { randomizeArray } from './randomize-array';

const TEST_ARRAY = ['one', 'two', 'three', 'four', 'five'];

describe('randomizeArray', () => {
    it('should return array of the same length', () => {
        expect(randomizeArray(TEST_ARRAY).length).toEqual(TEST_ARRAY.length);
    });

    it('should not always return the same array', () => {
        let sameResult = true;
        const iterations = 100;

        for (let i = 0; i < iterations; i++) {
            if (randomizeArray(TEST_ARRAY) !== TEST_ARRAY) sameResult = false;
            else break;
        }
        expect(sameResult).toBeFalse();
    });
});
