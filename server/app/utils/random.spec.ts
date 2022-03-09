/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { Random } from './random';

const DEFAULT_ARRAY = ['a', 'b', 'c'];
describe('random -> getRandomElementsFromArray', () => {
    it('should return an array of the desired length', () => {
        expect(Random.getRandomElementsFromArray(DEFAULT_ARRAY).length).to.equal(1);
        expect(Random.getRandomElementsFromArray(DEFAULT_ARRAY, 2).length).to.equal(2);
    });

    it('should return the entire array if the desired length is larger than the array.length', () => {
        const desiredElements = 10;
        expect(Random.getRandomElementsFromArray(DEFAULT_ARRAY, desiredElements)).to.deep.equal(DEFAULT_ARRAY);
    });

    it('should not always return the same element', () => {
        let result;
        let sameResult = true;
        const iterations = 100;
        for (let i = 0; i < iterations; i++) {
            const tmp = Random.getRandomElementsFromArray(DEFAULT_ARRAY);
            if (tmp[0] !== result && i !== 0) {
                sameResult = false;
                break;
            } else {
                result = tmp[0];
            }
        }
        expect(sameResult).to.be.false;
    });
});
