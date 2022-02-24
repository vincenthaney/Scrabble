import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';

export class StringConversion {
    static wordToString(words: [Square, Tile][][]): string[] {
        return words.map((word) =>
            word.reduce((previous, [, tile]) => (tile.playedLetter ? (previous += tile.playedLetter) : (previous += tile.letter)), ''),
        );
    }
}
