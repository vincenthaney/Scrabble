import { Orientation, ORIENTATION_HORIZONTAL_LETTER, ORIENTATION_VERTICAL_LETTER } from '@app/classes/orientation';
import { Position } from '@app/classes/position';
import { Tile } from '@app/classes/tile';

export class ActionPayloadToString {
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

    static tilesToString(tiles: Tile[]): string {
        return tiles.reduce((str, tile) => {
            return str + this.tileToLetterConversion(tile);
        }, '');
    }

    // static actionPayloadToInputString<T>(actionType: ActionType, payload: ActionPlacePayload): string {
    //     const tiles = payload.tiles ? this.tilesToString(payload.tiles) : '':
    //     const positionRow = payload.startPosition ? this.positionNumberToLetter(payload.startPosition.row) : '';
    //     const positionColumn = payload.startPosition ? `${payload.startPosition.column + 1}` : '';
    //     const orientation = payload.orientation ? this.orientationToLetter(payload.orientation) : '';
    //     return `${ACTION_COMMAND_INDICATOR}${actionType} ${positionRow}${positionColumn}${orientation} ${tiles}`;
    // }

    private static tileToLetterConversion(tile: Tile): string {
        return tile.isBlank ? tile.letter.toUpperCase() : tile.letter.toLowerCase();
    }
}
