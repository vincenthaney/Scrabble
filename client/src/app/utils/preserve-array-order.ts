export const preserveArrayOrder = <T, S = T>(array: T[], originalArray: S[], equals: (a: T, b: S) => boolean) => {
    const output: T[] = [];

    array = [...array];

    originalArray.forEach((original) => {
        const index = array.findIndex((i) => equals(i, original));
        const item = array.splice(index, 1).pop();

        if (item) output.push(item);
    });

    return output.concat(array);
};
