/* eslint-disable no-dupe-class-members */
import { Action, ActionExchange, ActionPass, ActionPlace } from '@app/classes/actions';
import { ActionData, ActionExchangePayload, ActionPlacePayload } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Service } from 'typedi';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import Player from '@app/classes/player/player';
import Game from '@app/classes/game/game';
import { INVALID_COMMAND, INVALID_PAYLOAD, NOT_PLAYER_TURN } from './game-player-error';

@Service()
export class GamePlayService {
    constructor(private readonly activeGameService: ActiveGameService) {}

    playAction(gameId: string, playerId: string, actionData: ActionData): GameUpdateData | void {
        const game = this.activeGameService.getGame(gameId, playerId);
        const player = game.getRequestingPlayer(playerId);
        if (player.getId() !== playerId) throw Error(NOT_PLAYER_TURN);

        const action: Action = this.getAction(player, game, actionData.type, actionData.payload);
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
        return updatedData;
    }

    getAction(player: Player, game: Game, type: string, payload: unknown): Action {
        let action: Action;
        switch (type) {
            case 'place': {
                const content = payload as ActionPlacePayload;
                if (content.tiles === undefined || !Array.isArray(content.tiles)) throw new Error(INVALID_PAYLOAD);
                if (content.position === undefined) throw new Error(INVALID_PAYLOAD);
                if (content.orientation === undefined) throw new Error(INVALID_PAYLOAD);
                action = new ActionPlace(player, game, content.tiles, content.position, content.orientation);
                break;
            }
            case 'exchange': {
                const content = payload as ActionExchangePayload;
                if (content.tiles === undefined || !Array.isArray(content.tiles)) throw new Error(INVALID_PAYLOAD);
                action = new ActionExchange(player, game, content.tiles);
                break;
            }
            case 'pass': {
                action = new ActionPass(player, game);
                break;
            }
            default: {
                throw Error(INVALID_COMMAND);
            }
        }
        return action;
    }
}
