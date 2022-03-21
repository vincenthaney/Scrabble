import { arrayDeepCopy } from './deep-copy';

interface TestObject {
    letter: string;
    value: number;
}

describe('DeepCopy', () => {
    it('arrayDeepCopy should return a deep copy of the array', () => {
        const originalArray: TestObject[] = [
            { letter: 'A', value: 0 },
            { letter: 'B', value: 1 },
            { letter: 'C', value: 2 },
        ];
        const copiedArray: TestObject[] = arrayDeepCopy(originalArray);
        expect(copiedArray).toEqual(originalArray);
        expect(copiedArray === originalArray).toBeFalse();
    });

    it('modifying a deep copied array should not modify original', () => {
        const originalArray: TestObject[] = [
            { letter: 'A', value: 0 },
            { letter: 'B', value: 1 },
            { letter: 'C', value: 2 },
        ];
        const copiedArray: TestObject[] = arrayDeepCopy(originalArray);
        copiedArray[0] = { letter: 'D', value: -1 };

        expect(originalArray[0]).toEqual({ letter: 'A', value: 0 });
    });
});
