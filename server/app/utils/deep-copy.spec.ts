import { expect } from 'chai';
import { arrayDeepCopy, setDeepCopy } from './deep-copy';

interface TestObject {
    letter: string;
    value: number;
}

describe('DeepCopy', () => {
    describe('arrayDeepCopy', () => {
        it('should return a deep copy of the array', () => {
            const originalArray: TestObject[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 1 },
                { letter: 'C', value: 2 },
            ];
            const copiedArray: TestObject[] = arrayDeepCopy(originalArray);
            expect(copiedArray).to.deep.equal(originalArray);
            expect(copiedArray).not.to.equal(originalArray);
        });

        it('modifying a deep copied array should not modify original', () => {
            const originalArray: TestObject[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 1 },
                { letter: 'C', value: 2 },
            ];
            const copiedArray: TestObject[] = arrayDeepCopy(originalArray);
            copiedArray[0] = { letter: 'D', value: -1 };

            expect(originalArray[0]).to.deep.equal({ letter: 'A', value: 0 });
        });
    });

    describe('setDeepCopy', () => {
        it('should return a deep copy of the set', () => {
            const originalSet: Set<TestObject> = new Set([
                { letter: 'A', value: 0 },
                { letter: 'B', value: 1 },
                { letter: 'C', value: 2 },
            ]);
            const copiedSet: Set<TestObject> = setDeepCopy(originalSet);
            expect(copiedSet).to.deep.equal(originalSet);
            expect(copiedSet).not.to.equal(originalSet);
        });

        it('modifying a deep copied array should not modify original', () => {
            const originalSet: Set<TestObject> = new Set([
                { letter: 'A', value: 0 },
                { letter: 'B', value: 1 },
                { letter: 'C', value: 2 },
            ]);
            const copiedSet: Set<TestObject> = setDeepCopy(originalSet);
            [...copiedSet.values()][0] = { letter: 'D', value: -1 };

            expect([...originalSet.values()][0]).to.deep.equal({ letter: 'A', value: 0 });
        });
    });
});
