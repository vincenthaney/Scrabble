import { Injectable } from '@angular/core';
import { ActionData, ActionType } from '@app/classes/actions/action-data';
import { Tile } from '@app/classes/tile';
import { CommandExceptionMessages } from '@app/constants/command-exception-messages';
import { SYSTEM_ERROR_ID } from '@app/constants/game';
import { NO_LOCAL_PLAYER } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import GameService from '@app/services/game/game.service';

@Injectable({
    providedIn: 'root',
})
export class GameButtonActionService {
    constructor(private gamePlayController: GamePlayController, private gameService: GameService) {}

    createPassAction(): void {
        const actionPass: ActionData = {
            type: ActionType.PASS,
            input: '',
            payload: {},
        };
        const localPlayerId = this.gameService.getLocalPlayerId();
        if (!localPlayerId) throw new Error(NO_LOCAL_PLAYER);
        this.gamePlayController.sendAction(this.gameService.gameId, localPlayerId, actionPass);
    }

    createExchangeAction(tiles: Tile[]): void {
        const player = this.gameService.getLocalPlayer();
        const gameId = this.gameService.gameId;

        if (!player) throw new Error(NO_LOCAL_PLAYER);
        if (tiles.some((tile) => !player?.getTiles().includes(tile))) {
            return this.sendError(CommandExceptionMessages.DontHaveTiles, gameId, player.id);
        }

        const actionExchange: ActionData = {
            type: ActionType.EXCHANGE,
            input: '',
            payload: { tiles },
        };

        this.gamePlayController.sendAction(gameId, player.id, actionExchange);
    }

    sendError(message: string, gameId: string, playerId: string): void {
        this.gamePlayController.sendError(gameId, playerId, {
            content: message,
            senderId: SYSTEM_ERROR_ID,
        });
    }
}
