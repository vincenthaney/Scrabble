import { Injectable } from '@angular/core';
import { ActionData, ActionExchangePayload, ActionPlacePayload, ActionType } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/orientation';
import { Position } from '@app/classes/position';
import { Tile } from '@app/classes/tile';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';

@Injectable({
    providedIn: 'root',
})
export class ActionService {
    private preSendActionCallbacksMap: Map<ActionType, ((actionData: ActionData, gameId?: string, playerId?: string) => void)[]>;

    constructor(private gamePlayController: GamePlayController) {
        this.preSendActionCallbacksMap = new Map();
        this.preSendActionCallbacksMap.set(ActionType.PLACE, [
            (actionData: ActionData) => this.convertBlankTilesLetter((actionData as ActionData<ActionPlacePayload>).payload),
        ]);
    }

    createPlaceActionPayload(tiles: Tile[], startPosition: Position, orientation: Orientation): ActionPlacePayload {
        return {
            tiles,
            startPosition,
            orientation,
        };
    }

    createExchangeActionPayload(tiles: Tile[]): ActionExchangePayload {
        return { tiles };
    }

    createActionData<T>(actionType: ActionType, actionPayload?: unknown, input?: string): ActionData<T> {
        input = input ? input : this.createInputFromPayload(actionType, actionPayload);
        actionPayload = actionPayload ? actionPayload : {};
        return {
            type: actionType,
            input,
            payload: actionPayload as T,
        } as ActionData<T>;
    }

    sendAction(gameId: string, playerId: string | undefined, actionData: ActionData): void {
        if (!playerId) return;

        const callbacks = this.preSendActionCallbacksMap.get(actionData.type);
        if (callbacks) {
            callbacks.forEach((callback) => callback(actionData, gameId, playerId));
        }

        this.gamePlayController.sendAction(gameId, playerId, actionData);
    }

    private convertBlankTilesLetter(actionPlacePayload: ActionPlacePayload): void {
        actionPlacePayload.tiles.forEach((tile) => {
            if (tile.isBlank && tile.playedLetter) tile.letter = tile.playedLetter;
        });
    }

    // eslint-disable-next-line no-unused-vars
    private createInputFromPayload<T>(actionType: ActionType, payload: T): string {
        // const inputTiles = payload.tiles ? payload.tiles.
        return 'input';
    }
}
