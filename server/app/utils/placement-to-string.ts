import { Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding/word-placement';
import { ORIENTATION_HORIZONTAL_LETTER, ORIENTATION_VERTICAL_LETTER } from '@app/constants/classes-constants';

export class PlacementToString {
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

    static tilesToString(tiles: Tile[], inUpperCase: boolean = false): string {
        return tiles.reduce((str, tile) => {
            return str + this.tileToLetterConversion(tile, inUpperCase);
        }, '');
    }

    static wordPlacementToCommandString(placement: WordPlacement): string {
        return `${this.positionAndOrientationToString(placement.startPosition, placement.orientation)} ${this.tilesToString(placement.tilesToPlace)}`;
    }

    private static tileToLetterConversion(tile: Tile, inUpperCase: boolean = false): string {
        return inUpperCase || tile.isBlank ? tile.letter.toUpperCase() : tile.letter.toLowerCase();
    }
}
