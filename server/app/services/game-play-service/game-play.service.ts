import { Action, ActionExchange, ActionHelp, ActionPass, ActionPlace, ActionReserve } from '@app/classes/actions';
import ActionHint from '@app/classes/actions/action-hint/action-hint';
import { Position } from '@app/classes/board';
import { ActionData, ActionExchangePayload, ActionPlacePayload, ActionType } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { GameObjectivesData } from '@app/classes/communication/objective-data';
import { RoundData } from '@app/classes/communication/round-data';
import Game from '@app/classes/game/game';
import { GameType } from '@app/classes/game/game-type';
import Player from '@app/classes/player/player';
import { IS_OPPONENT, IS_REQUESTING } from '@app/constants/game';
import { INVALID_COMMAND, INVALID_PAYLOAD, NOT_PLAYER_TURN } from '@app/constants/services-errors';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import GameHistoriesService from '@app/services/game-histories-service/game-histories.service';
import HighScoresService from '@app/services/high-scores-service/high-scores.service';
import { Service } from 'typedi';
import { FeedbackMessages } from './feedback-messages';

@Service()
export class GamePlayService {
    constructor(
        private readonly activeGameService: ActiveGameService,
        private readonly highScoresService: HighScoresService,
        private readonly dictionaryService: DictionaryService,
        private readonly gameHistoriesService: GameHistoriesService,
    ) {
        this.activeGameService.playerLeftEvent.on('playerLeft', async (gameId, playerWhoLeftId) => {
            await this.handlePlayerLeftEvent(gameId, playerWhoLeftId);
        });
    }

    async playAction(gameId: string, playerId: string, actionData: ActionData): Promise<[void | GameUpdateData, void | FeedbackMessages]> {
        const game = this.activeGameService.getGame(gameId, playerId);
        const player = game.getPlayer(playerId, IS_REQUESTING);
        if (player.id !== playerId) throw new Error(NOT_PLAYER_TURN);
        if (game.gameIsOver) return [undefined, undefined];

        const action: Action = this.getAction(player, game, actionData);

        let updatedData: void | GameUpdateData = action.execute();

        const localPlayerFeedback = action.getMessage();
        const opponentFeedback = action.getOpponentMessage();
        let endGameFeedback: string[] | undefined;

        if (updatedData) {
            updatedData = this.addMissingPlayerId(gameId, playerId, updatedData);
            updatedData.tileReserve = Array.from(game.getTilesLeftPerLetter(), ([letter, amount]) => ({ letter, amount }));
        }

        if (action.willEndTurn()) {
            const nextRound = game.roundManager.nextRound(action);
            const nextRoundData: RoundData = game.roundManager.convertRoundToRoundData(nextRound);
            if (updatedData) updatedData.round = nextRoundData;
            else updatedData = { round: nextRoundData };
            if (game.areGameOverConditionsMet()) {
                endGameFeedback = await this.handleGameOver(undefined, game, updatedData);
            }
        }
        return [updatedData, { localPlayerFeedback, opponentFeedback, endGameFeedback }];
    }

    getAction(player: Player, game: Game, actionData: ActionData): Action {
        switch (actionData.type) {
            case ActionType.PLACE: {
                const payload = this.getActionPlacePayload(actionData);
                const startPosition = new Position(payload.startPosition.row, payload.startPosition.column);
                return new ActionPlace(player, game, { tilesToPlace: payload.tiles ?? [], startPosition, orientation: payload.orientation });
            }
            case ActionType.EXCHANGE: {
                const payload = this.getActionExchangePayload(actionData);
                return new ActionExchange(player, game, payload.tiles ?? []);
            }
            case ActionType.PASS: {
                return new ActionPass(player, game);
            }
            case ActionType.HELP: {
                return new ActionHelp(player, game);
            }
            case ActionType.RESERVE: {
                return new ActionReserve(player, game);
            }
            case ActionType.HINT: {
                return new ActionHint(player, game);
            }
            default: {
                throw Error(INVALID_COMMAND);
            }
        }
    }

    getActionPlacePayload(actionData: ActionData): ActionPlacePayload {
        const payload = actionData.payload as ActionPlacePayload;
        if (payload.tiles === undefined || !Array.isArray(payload.tiles) || !payload.tiles.length) throw new Error(INVALID_PAYLOAD);
        if (payload.startPosition === undefined) throw new Error(INVALID_PAYLOAD);
        if (payload.orientation === undefined) throw new Error(INVALID_PAYLOAD);
        return payload;
    }

    getActionExchangePayload(actionData: ActionData): ActionExchangePayload {
        const payload = actionData.payload as ActionExchangePayload;
        if (payload.tiles === undefined || !Array.isArray(payload.tiles) || !payload.tiles.length) throw new Error(INVALID_PAYLOAD);
        return payload;
    }

    isGameOver(gameId: string, playerId: string): boolean {
        return this.activeGameService.getGame(gameId, playerId).gameIsOver;
    }

    handleResetObjectives(gameId: string, playerId: string): GameUpdateData {
        const game: Game = this.activeGameService.getGame(gameId, playerId);
        if (game.gameType === GameType.Classic) return {};

        const objectiveData: GameObjectivesData = game.resetPlayerObjectiveProgression(playerId);
        return { gameObjective: objectiveData };
    }

    private async handleGameOver(winnerName: string | undefined, game: Game, updatedData: GameUpdateData): Promise<string[]> {
        const [updatedScorePlayer1, updatedScorePlayer2] = game.endOfGame(winnerName);
        if (!game.isAddedToDatabase) {
            const connectedRealPlayers = game.getConnectedRealPlayers();
            for (const player of connectedRealPlayers) {
                await this.highScoresService.addHighScore(player.name, player.score, game.gameType);
            }
            this.gameHistoriesService.addGameHistory(game.gameHistory);
            game.isAddedToDatabase = true;
        }

        this.dictionaryService.stopUsingDictionary(game.dictionarySummary.id);

        if (updatedData.player1) updatedData.player1.score = updatedScorePlayer1;
        else updatedData.player1 = { id: game.player1.id, score: updatedScorePlayer1 };
        if (updatedData.player2) updatedData.player2.score = updatedScorePlayer2;
        else updatedData.player2 = { id: game.player2.id, score: updatedScorePlayer2 };

        updatedData.isGameOver = true;
        return game.endGameMessage(winnerName);
    }

    private async handlePlayerLeftEvent(gameId: string, playerWhoLeftId: string): Promise<void> {
        const game = this.activeGameService.getGame(gameId, playerWhoLeftId);
        const playerStillInGame = game.getPlayer(playerWhoLeftId, IS_OPPONENT);
        game.getPlayer(playerWhoLeftId, IS_REQUESTING).isConnected = false;
        let updatedData: GameUpdateData = {};
        const endOfGameMessages = await this.handleGameOver(playerStillInGame.name, game, updatedData);
        updatedData = this.addMissingPlayerId(gameId, playerStillInGame.id, updatedData);
        this.activeGameService.playerLeftEvent.emit('playerLeftFeedback', gameId, endOfGameMessages, updatedData);
    }

    private addMissingPlayerId(gameId: string, playerId: string, gameUpdateData: GameUpdateData): GameUpdateData {
        const game: Game = this.activeGameService.getGame(gameId, playerId);
        const newgameUpdateData: GameUpdateData = { ...gameUpdateData };
        if (newgameUpdateData.player1) {
            newgameUpdateData.player1.id = game.player1.id;
        }
        if (newgameUpdateData.player2) {
            newgameUpdateData.player2.id = game.player2.id;
        }
        return newgameUpdateData;
    }
}
