/* eslint-disable no-dupe-class-members */
import { Action, ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData, ActionExchangePayload, ActionPlacePayload } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { Tile } from '@app/classes/tile';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { Service } from 'typedi';
import { INVALID_COMMAND, INVALID_PAYLOAD, NOT_PLAYER_TURN } from './game-player-error';

@Service()
export class GamePlayService {
    constructor(private readonly activeGameService: ActiveGameService) {}

    playAction(gameId: string, playerId: string, actionData: ActionData): [GameUpdateData | void, string, string] {
        const game = this.activeGameService.getGame(gameId, playerId);
        const player = game.getRequestingPlayer(playerId);

        if (player.getId() !== playerId) throw Error(NOT_PLAYER_TURN);

        const localPlayerFeedback = this.getLocalPlayerFeedback(player, actionData);
        const opponentFeedback = this.getOpponentFeedback(player, actionData);
        const action: Action = this.getAction(player, game, actionData);
        let updatedData: void | GameUpdateData = action.execute();

        if (action.willEndTurn()) {
            const nextRound = game.roundManager.nextRound(action);
            if (updatedData) updatedData.round = nextRound;
            else updatedData = { round: nextRound };
        }

        if (game.isGameOver()) {
            if (updatedData) updatedData.isGameOver = true;
            else updatedData = { isGameOver: true };
        }

        return [updatedData, localPlayerFeedback, opponentFeedback];
    }

    getAction(player: Player, game: Game, actionData: ActionData): Action {
        switch (actionData.type) {
            case 'place': {
                const payload = this.getActionPlacePayload(actionData);
                return new ActionPlace(player, game, payload.tiles, payload.position, payload.orientation);
            }
            case 'exchange': {
                const payload = this.getActionExchangePayload(actionData);
                return new ActionExchange(player, game, payload.tiles);
            }
            case 'pass': {
                return new ActionPass(player, game);
            }
            default: {
                throw Error(INVALID_COMMAND);
            }
        }
    }

    getLocalPlayerFeedback(player: Player, actionData: ActionData): string {
        switch (actionData.type) {
            case 'place': {
                const payload = this.getActionPlacePayload(actionData);
                return `Vous avez placé ${payload.tiles.map((tile: Tile) => tile.letter).join(', ')}`;
            }
            case 'exchange': {
                const payload = this.getActionExchangePayload(actionData);
                return `Vous avez échangé ${payload.tiles.map((tile: Tile) => tile.letter).join(', ')}`;
            }
            case 'pass': {
                return 'Vous avez passé votre tour';
            }
            default: {
                throw Error(INVALID_COMMAND);
            }
        }
    }

    getOpponentFeedback(player: Player, actionData: ActionData): string {
        switch (actionData.type) {
            case 'place': {
                const payload = this.getActionPlacePayload(actionData);
                return `${player.name} a placé ${payload.tiles.map((tile: Tile) => tile.letter).join(', ')}`;
            }
            case 'exchange': {
                const payload = this.getActionExchangePayload(actionData);
                return `${player.name} a échangé ${payload.tiles.length} tuiles`;
            }
            case 'pass': {
                return `${player.name} a passé son tour`;
            }
            default: {
                throw Error(INVALID_COMMAND);
            }
        }
    }

    getActionPlacePayload(actionData: ActionData) {
        const payload = actionData.payload as ActionPlacePayload;
        if (payload.tiles === undefined || !Array.isArray(payload.tiles)) throw new Error(INVALID_PAYLOAD);
        if (payload.position === undefined) throw new Error(INVALID_PAYLOAD);
        if (payload.orientation === undefined) throw new Error(INVALID_PAYLOAD);
        return payload;
    }

    getActionExchangePayload(actionData: ActionData) {
        const payload = actionData.payload as ActionExchangePayload;
        if (payload.tiles === undefined || !Array.isArray(payload.tiles)) throw new Error(INVALID_PAYLOAD);
        return payload;
    }
}
