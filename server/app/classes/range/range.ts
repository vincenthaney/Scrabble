import { INVALID_POINT_RANGE } from '@app/constants/classes-errors';

export default class Range {
    constructor(private minimum: number, private maximum: number) {
        if (!Range.validateRangeValues(minimum, maximum)) throw new Error(INVALID_POINT_RANGE);
    }

    static validateRangeValues(minimum: number, maximum: number) {
        return minimum <= maximum;
    }

    get min(): number {
        return this.minimum;
    }

    get max(): number {
        return this.maximum;
    }
    set min(minimum: number) {
        if (!Range.validateRangeValues(minimum, this.maximum)) throw new Error(INVALID_POINT_RANGE);
        this.minimum = minimum;
    }

    set max(maximum: number) {
        if (!Range.validateRangeValues(this.minimum, maximum)) throw new Error(INVALID_POINT_RANGE);
        this.maximum = maximum;
    }

    *[Symbol.iterator]() {
        for (let i = this.minimum; i <= this.maximum; ++i) yield i;
    }

    isWithinRange(value: number) {
        return value >= this.minimum && value <= this.maximum;
    }
}
