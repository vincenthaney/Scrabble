import { Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding';
import { ORIENTATION_HORIZONTAL_LETTER, ORIENTATION_VERTICAL_LETTER } from '@app/constants/classes-constants';

export class WordPlacementUtils {
    static positionNumberToLetter(position: number): string {
        return String.fromCharCode(position + 'a'.charCodeAt(0));
    }

    static orientationToLetter(orientation: Orientation): string {
        switch (orientation) {
            case Orientation.Horizontal:
                return ORIENTATION_HORIZONTAL_LETTER;
            case Orientation.Vertical:
                return ORIENTATION_VERTICAL_LETTER;
        }
    }

    static positionAndOrientationToString(position: Position, orientation: Orientation): string {
        return `${this.positionNumberToLetter(position.row)}${position.column + 1}${this.orientationToLetter(orientation)}`;
    }

    static tilesToString(tiles: Tile[]) {
        return tiles.reduce((str, tile) => str + tile.letter.toLowerCase(), '');
    }

    static wordPlacementToCommandString(placement: WordPlacement) {
        return `${this.positionAndOrientationToString(placement.startPosition, placement.orientation)} ${this.tilesToString(placement.tilesToPlace)}`;
    }
}
