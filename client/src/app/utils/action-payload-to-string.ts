import { ActionType, ACTION_COMMAND_INDICATOR, ExchangeActionPayload, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation, ORIENTATION_HORIZONTAL_LETTER, ORIENTATION_VERTICAL_LETTER } from '@app/classes/orientation';
import { Tile } from '@app/classes/tile';
import { INVALID_PAYLOAD_FOR_ACTION_TYPE } from '@app/constants/services-errors';

export class ActionPayloadToString {
    static placeActionPayloadToString(placePayload: PlaceActionPayload): string {
        if (this.isInvalidPlacePayload(placePayload)) throw new Error(INVALID_PAYLOAD_FOR_ACTION_TYPE);

        const tiles = this.tilesToString(placePayload.tiles);
        const positionRow = this.positionNumberToLetter(placePayload.startPosition.row);
        const positionColumn = `${placePayload.startPosition.column + 1}`;
        const orientation = this.orientationToLetter(placePayload.orientation);
        return `${ACTION_COMMAND_INDICATOR}${ActionType.PLACE} ${positionRow}${positionColumn}${orientation} ${tiles}`;
    }

    static exchangeActionPayloadToString(exchangePayload: ExchangeActionPayload): string {
        if (!exchangePayload.tiles) throw new Error(INVALID_PAYLOAD_FOR_ACTION_TYPE);

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

    private static isInvalidPlacePayload(placePayload: PlaceActionPayload): boolean {
        return !placePayload.orientation || !placePayload.startPosition || !placePayload.tiles;
    }
}
