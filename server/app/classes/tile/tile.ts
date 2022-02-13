import { LetterValue } from './tile.types';

export default interface Tile {
    letter: LetterValue;
    value: number;
    isBlank?: boolean;
}
