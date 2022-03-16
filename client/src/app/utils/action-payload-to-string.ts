import { ActionExchangePayload, ActionPlacePayload, ActionType, ACTION_COMMAND_INDICATOR } from '@app/classes/actions/action-data';
import { Orientation, ORIENTATION_HORIZONTAL_LETTER, ORIENTATION_VERTICAL_LETTER } from '@app/classes/orientation';
import { Tile } from '@app/classes/tile';

export class ActionPayloadToString {
    static placeActionPayloadToString(placePayload: ActionPlacePayload): string {
        const tiles = this.tilesToString(placePayload.tiles);
        const positionRow = this.positionNumberToLetter(placePayload.startPosition.row);
        const positionColumn = `${placePayload.startPosition.column + 1}`;
        const orientation = this.orientationToLetter(placePayload.orientation);
        return `${ACTION_COMMAND_INDICATOR}${ActionType.PLACE} ${positionRow}${positionColumn}${orientation} ${tiles}`;
    }

    static exchangeActionPayloadToString(exchangePayload: ActionExchangePayload): string {
        return `${ACTION_COMMAND_INDICATOR}${ActionType.EXCHANGE} ${this.tilesToString(exchangePayload.tiles)}`;
    }

    static simpleActionToString(actionType: ActionType): string {
        return `${ACTION_COMMAND_INDICATOR}${actionType}`;
    }

    private static positionNumberToLetter(position: number): string {
        return String.fromCharCode(position + 'a'.charCodeAt(0));
    }

    private static orientationToLetter(orientation: Orientation): string {
        switch (orientation) {
            case Orientation.Horizontal:
                return ORIENTATION_HORIZONTAL_LETTER;
            case Orientation.Vertical:
                return ORIENTATION_VERTICAL_LETTER;
        }
    }

    private static tilesToString(tiles: Tile[]): string {
        return tiles.reduce((str, tile) => {
            return str + this.tileToLetterConversion(tile);
        }, '');
    }

    private static tileToLetterConversion(tile: Tile): string {
        return tile.isBlank ? tile.letter.toUpperCase() : tile.letter.toLowerCase();
    }
}
