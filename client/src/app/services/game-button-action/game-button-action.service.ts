import { Injectable } from '@angular/core';
import { ActionData, ActionPlacePayload, ActionType } from '@app/classes/actions/action-data';
import { AbstractPlayer } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { CommandExceptionMessages } from '@app/constants/command-exception-messages';
import { SYSTEM_ERROR_ID } from '@app/constants/game';
import { NO_LOCAL_PLAYER } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import GameService from '@app/services/game/game.service';

const INDEX_NOT_FOUND = -1;

@Injectable({
    providedIn: 'root',
})
export class GameButtonActionService {
    constructor(private gamePlayController: GamePlayController, private gameService: GameService) {}

    getPlayerIfTurn(): AbstractPlayer | undefined {
        const player = this.gameService.getLocalPlayer();

        if (!player) throw new Error(NO_LOCAL_PLAYER);

        if (this.gameService.isLocalPlayerPlaying()) return player;

        this.sendError(CommandExceptionMessages.NotYourTurn, this.gameService.getGameId(), player.id);
        return undefined;
    }

    createPassAction(): void {
        const actionPass: ActionData = {
            type: ActionType.PASS,
            input: '',
            payload: {},
        };
        const localPlayerId = this.gameService.getLocalPlayerId();
        if (!localPlayerId) throw new Error(NO_LOCAL_PLAYER);
        this.gamePlayController.sendAction(this.gameService.getGameId(), localPlayerId, actionPass);
    }

    sendExchangeAction(tiles: Tile[]): void {
        const player = this.getPlayerIfTurn();
        if (!player) return;

        const gameId = this.gameService.getGameId();

        if (!this.checkIfPlayerHasTiles(tiles, player)) {
            return this.sendError(CommandExceptionMessages.DontHaveTiles, gameId, player.id);
        }

        const actionExchange: ActionData = {
            type: ActionType.EXCHANGE,
            input: '',
            payload: { tiles },
        };

        this.gamePlayController.sendAction(gameId, player.id, actionExchange);
    }

    sendPlaceAction(payload: ActionPlacePayload) {
        const player = this.getPlayerIfTurn();
        if (!player) return;

        const gameId = this.gameService.getGameId();

        payload.tiles.forEach((tile) => {
            if (tile.isBlank && tile.playedLetter) tile.letter = tile.playedLetter;
        });

        this.gamePlayController.sendAction(gameId, player.id, {
            type: ActionType.PLACE,
            input: '',
            payload,
        });
    }

    private checkIfPlayerHasTiles(tiles: Tile[], player: AbstractPlayer): boolean {
        const playerTiles = [...player.getTiles()];

        for (const tile of tiles) {
            const index = playerTiles.findIndex((t) => t.letter === tile.letter);

            if (index === INDEX_NOT_FOUND) return false;

            playerTiles.splice(index, 1);
        }

        return true;
    }

    private sendError(message: string, gameId: string, playerId: string): void {
        this.gamePlayController.sendError(gameId, playerId, {
            content: message,
            senderId: SYSTEM_ERROR_ID,
        });
    }
}
