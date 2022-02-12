/* eslint-disable no-dupe-class-members */
import { Action, ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData, ActionExchangePayload, ActionPlacePayload } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Service } from 'typedi';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import Player from '@app/classes/player/player';
import Game from '@app/classes/game/game';
import { INVALID_COMMAND, INVALID_PAYLOAD, NOT_PLAYER_TURN } from './game-player-error';
import { Position } from '@app/classes/board';

@Service()
export class GamePlayService {
    constructor(private readonly activeGameService: ActiveGameService) {}

    playAction(gameId: string, playerId: string, actionData: ActionData): GameUpdateData | void {
        const game = this.activeGameService.getGame(gameId, playerId);
        const player = game.getRequestingPlayer(playerId);

        if (player.getId() !== playerId) throw Error(NOT_PLAYER_TURN);

        const action: Action = this.getAction(player, game, actionData);
        let updatedData: void | GameUpdateData = action.execute();

        if (action.willEndTurn()) {
            const nextRound = game.roundManager.nextRound(action);
            if (updatedData) updatedData.round = nextRound;
            else updatedData = { round: nextRound };
            if (game.isGameOver()) {
                // Send messages to players
                // TODO: Make sure it is sent AFTER action message
                game.endOfGame();
                updatedData.isGameOver = true;
            }
        }
        return updatedData;
    }

    getAction(player: Player, game: Game, actionData: ActionData): Action {
        switch (actionData.type) {
            case 'place': {
                const payload = this.getActionPlacePayload(actionData);
                const position = new Position(payload.position.column, payload.position.row);
                return new ActionPlace(player, game, payload.tiles, position, payload.orientation);
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
