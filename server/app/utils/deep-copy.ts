export const arrayDeepCopy = <T>(originalArray: T[]): T[] => {
    return originalArray.map((e) => ({ ...e }));
};

export const setDeepCopy = <T>(originalSet: Set<T>): Set<T> => {
    return JSON.parse(JSON.stringify(originalSet));
};
