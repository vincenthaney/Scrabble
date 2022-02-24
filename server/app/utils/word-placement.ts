import { Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding';
import { ORIENTATION_HORIZONTAL_LETTER, ORIENTATION_VERTICAL_LETTER } from '@app/constants/classes-constants';

export const positionNumberToLetter = (position: number): string => {
    return String.fromCharCode(position + 'a'.charCodeAt(0));
};

export const orientationToLetter = (orientation: Orientation): string => {
    switch (orientation) {
        case Orientation.Horizontal:
            return ORIENTATION_HORIZONTAL_LETTER;
        case Orientation.Vertical:
            return ORIENTATION_VERTICAL_LETTER;
    }
};

export const tilesToString = (tiles: Tile[]) => {
    return tiles.reduce((str, tile) => str + tile.letter, '');
};

export const positionAndOrientationToString = (position: Position, orientation: Orientation): string => {
    return `${positionNumberToLetter(position.column)}${position.row + 1}${orientationToLetter(orientation)}`;
};

export const wordPlacementToCommandString = (placement: WordPlacement) => {
    return `${positionAndOrientationToString(placement.startPosition, placement.orientation)} ${tilesToString(placement.tilesToPlace)}`;
};
