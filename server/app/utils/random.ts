export class Random {
    static getRandomElementsFromArray<T>(array: T[], elementsToTake: number = 1): T[] {
        if (elementsToTake > array.length) return array;
        const result = new Array(elementsToTake);
        let length = array.length;
        const taken = new Array(length);
        while (elementsToTake--) {
            const x = Math.floor(Math.random() * length);
            result[elementsToTake] = array[x in taken ? taken[x] : x];
            taken[x] = --length in taken ? taken[length] : length;
        }
        return result;
    }
}
