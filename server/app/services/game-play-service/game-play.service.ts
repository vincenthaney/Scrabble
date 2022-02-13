import { Action, ActionExchange, ActionHelp, ActionPass, ActionPlace, ActionReserve } from '@app/classes/actions';
import { Position } from '@app/classes/board';
import { ActionData, ActionExchangePayload, ActionPlacePayload } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { INVALID_COMMAND, INVALID_PAYLOAD, NOT_PLAYER_TURN } from '@app/constants/services-errors';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { Service } from 'typedi';
import { FeedbackMessages } from './feedback-messages';

@Service()
export class GamePlayService {
    constructor(private readonly activeGameService: ActiveGameService) {}

    playAction(gameId: string, playerId: string, actionData: ActionData): [GameUpdateData | void, FeedbackMessages | void] {
        const game = this.activeGameService.getGame(gameId, playerId);
        const player = game.getRequestingPlayer(playerId);

        if (player.getId() !== playerId) throw Error(NOT_PLAYER_TURN);

        const action: Action = this.getAction(player, game, actionData);
        const localPlayerFeedback = action.getMessage();
        const opponentFeedback = action.getOpponentMessage();
        let endGameFeedback: string[] | undefined;

        let updatedData: void | GameUpdateData = action.execute();

        if (updatedData) {
            updatedData.tileReserve = Array.from(game.getTilesLeftPerLetter(), ([letter, amount]) => ({ letter, amount }));
            updatedData.tileReserveTotal = updatedData.tileReserve.reduce((prev, { amount }) => prev + amount, 0);
        }

        if (action.willEndTurn()) {
            const nextRound = game.roundManager.nextRound(action);
            if (updatedData) updatedData.round = nextRound;
            else updatedData = { round: nextRound };
            if (game.isGameOver()) {
                const [updatedScorePlayer1, updatedScorePlayer2] = game.endOfGame();

                if (updatedData.player1) updatedData.player1.score = updatedScorePlayer1;
                else updatedData.player1 = { score: updatedScorePlayer1 };
                if (updatedData.player2) updatedData.player2.score = updatedScorePlayer2;
                else updatedData.player2 = { score: updatedScorePlayer2 };

                endGameFeedback = game.endGameMessage();
                updatedData.isGameOver = true;
            }
        }
        return [updatedData, { localPlayerFeedback, opponentFeedback, endGameFeedback }];
    }

    getAction(player: Player, game: Game, actionData: ActionData): Action {
        switch (actionData.type) {
            case 'place': {
                const payload = this.getActionPlacePayload(actionData);
                const position = new Position(payload.startPosition.column, payload.startPosition.row);
                return new ActionPlace(player, game, payload.tiles, position, payload.orientation);
            }
            case 'exchange': {
                const payload = this.getActionExchangePayload(actionData);
                return new ActionExchange(player, game, payload.tiles);
            }
            case 'pass': {
                return new ActionPass(player, game);
            }
            case 'help': {
                return new ActionHelp(player, game);
            }
            case 'reserve': {
                return new ActionReserve(player, game);
            }
            default: {
                throw Error(INVALID_COMMAND);
            }
        }
    }

    getActionPlacePayload(actionData: ActionData) {
        const payload = actionData.payload as ActionPlacePayload;
        if (payload.tiles === undefined || !Array.isArray(payload.tiles)) throw new Error(INVALID_PAYLOAD);
        if (payload.startPosition === undefined) throw new Error(INVALID_PAYLOAD);
        if (payload.orientation === undefined) throw new Error(INVALID_PAYLOAD);
        return payload;
    }

    getActionExchangePayload(actionData: ActionData) {
        const payload = actionData.payload as ActionExchangePayload;
        if (payload.tiles === undefined || !Array.isArray(payload.tiles)) throw new Error(INVALID_PAYLOAD);
        return payload;
    }
}
