import { LetterValue } from './tile.types';

export default class Tile {
    letter: LetterValue;
    value: number;

    constructor(letter: LetterValue, value: number) {
        this.letter = letter;
        this.value = value;
    }
}
