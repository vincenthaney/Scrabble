import { expect } from 'chai';
import { reduce } from './array';

describe('Array', () => {
    it('reduce: should return default value when array is empty', () => {
        const array: number[] = [];
        const defaultValue = 'DEFAULT_VALUE';
        const value = reduce(array, defaultValue, () => '');

        expect(value).to.equal(defaultValue);
    });

    it('reduce: should work', () => {
        const array = [1, 2, 3];
        const expected = '123';
        const value = reduce(array, '', (p, v) => p + v);

        expect(value).to.equal(expected);
    });
});
