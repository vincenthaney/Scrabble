export class Random {
    static getRandomElementsFromArray<T>(array: T[], elementsToTake: number = 1): T[] {
        const result = new Array(elementsToTake);
        let length = array.length;
        const taken = new Array(length);
        if (elementsToTake > length) return result;
        while (elementsToTake--) {
            const x = Math.floor(Math.random() * length);
            result[elementsToTake] = array[x in taken ? taken[x] : x];
            taken[x] = --length in taken ? taken[length] : length;
        }
        return result;
    }
}
