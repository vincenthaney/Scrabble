import { Injectable } from '@angular/core';
import { ActionData, ActionPayload, ActionType, ExchangeActionPayload, PlaceActionPayload } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/orientation';
import { Position } from '@app/classes/position';
import { Tile } from '@app/classes/tile';
import { INVALID_PAYLOAD_FOR_ACTION_TYPE } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { ActionPayloadToString } from '@app/utils/action-payload-to-string';

@Injectable({
    providedIn: 'root',
})
export class ActionService {
    private preSendActionCallbacksMap: Map<ActionType, ((actionData: ActionData, gameId?: string, playerId?: string) => void)[]>;

    constructor(private gamePlayController: GamePlayController) {
        this.preSendActionCallbacksMap = new Map();
        this.preSendActionCallbacksMap.set(ActionType.PLACE, [
            (actionData: ActionData) => {
                this.convertBlankTilesLetter((actionData.payload as PlaceActionPayload).tiles);
            },
        ]);
    }

    createPlaceActionPayload(tiles: Tile[], startPosition: Position, orientation: Orientation): PlaceActionPayload {
        return {
            tiles,
            startPosition,
            orientation,
        };
    }

    createExchangeActionPayload(tiles: Tile[]): ExchangeActionPayload {
        return { tiles };
    }

    createActionData(actionType: ActionType, actionPayload: ActionPayload, input?: string): ActionData {
        input = input ?? this.createInputFromPayload(actionType, actionPayload);
        return {
            type: actionType,
            input,
            payload: actionPayload,
        };
    }

    sendAction(gameId: string, playerId: string | undefined, actionData: ActionData): void {
        if (!playerId) return;

        const callbacks = this.preSendActionCallbacksMap.get(actionData.type);
        if (callbacks) {
            callbacks.forEach((callback) => callback(actionData, gameId, playerId));
        }

        this.gamePlayController.sendAction(gameId, playerId, actionData);
    }

    private convertBlankTilesLetter(tiles: Tile[]): void {
        tiles.forEach((tile) => {
            if (tile.isBlank && tile.playedLetter) tile.letter = tile.playedLetter;
        });
    }

    private createInputFromPayload(actionType: ActionType, payload: ActionPayload): string {
        switch (actionType) {
            case ActionType.PLACE:
                if (!(payload as PlaceActionPayload)) throw new Error(INVALID_PAYLOAD_FOR_ACTION_TYPE);
                return ActionPayloadToString.placeActionPayloadToString(payload as PlaceActionPayload);
            case ActionType.EXCHANGE:
                if (!(payload as ExchangeActionPayload)) throw new Error(INVALID_PAYLOAD_FOR_ACTION_TYPE);
                return ActionPayloadToString.exchangeActionPayloadToString(payload as ExchangeActionPayload);
            default:
                return ActionPayloadToString.simpleActionToString(actionType);
        }
    }
}
