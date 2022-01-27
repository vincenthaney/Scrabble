export const reduce = <T, S>(array: T[], start: S, callback: (previous: S, value: T, index: number, array: T[]) => S): S => {
    let o = start;
    array.forEach((v, i, a) => {
        o = callback(o, v, i, a);
    });
    return o;
};
