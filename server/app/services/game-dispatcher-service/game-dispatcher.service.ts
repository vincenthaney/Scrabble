import { GameConfig, GameConfigData, MultiplayerGameConfig } from '@app/classes/game/game-config';
import WaitingGame from '@app/classes/game/waiting-game';
import { Service } from 'typedi';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import Player from '@app/classes/player/player';
import * as GameDispatcherError from './game-dispatcher.service.error';
import * as Errors from '@app/constants/errors';
import Game from '@app/classes/game/game';

@Service()
export class GameDispatcherService {
    private waitingGames: WaitingGame[];

    constructor(private activeGameService: ActiveGameService) {
        this.waitingGames = [];
    }

    /**
     * Add the configuration into the waiting game list
     *
     * @param {GameConfigData} configData Necessary information to create the game
     * @return {string} Waiting game id
     */

    createMultiplayerGame(configData: GameConfigData): string {
        const config: GameConfig = {
            player: new Player(configData.playerId, configData.playerName),
            gameType: configData.gameType,
            maxRoundTime: configData.maxRoundTime,
            dictionary: configData.dictionary,
        };
        const waitingGame = new WaitingGame(config);
        this.waitingGames.push(waitingGame);
        return waitingGame.getId();
    }

    /**
     * The second player ask the initiating player to join their game
     *
     * @param {string} waitingGameId Id of the game in the lobby
     * @param playerId Id of the player asking to join
     * @param playerName Name the player want to use
     */

    requestJoinGame(waitingGameId: string, playerId: string, playerName: string) {
        const waitingGame = this.getGameFromId(waitingGameId);

        if (waitingGame.joinedPlayer !== undefined) {
            throw new Error(GameDispatcherError.PLAYER_ALREADY_TRYING_TO_JOIN);
        }
        if (waitingGame.getConfig().player.name === playerName) {
            throw new Error(GameDispatcherError.CANNOT_HAVE_SAME_NAME);
        }

        const joiningPlayer = new Player(playerId, playerName);
        waitingGame.joinedPlayer = joiningPlayer;
        // TODO: Inform initiating player that another is trying to join
    }

    /**
     * The initiating player accept their opponent and the game starts
     *
     * @param waitingGameId Id of the game in the lobby
     * @param playerId Id of the initiating player
     * @param opponentName Opponent name
     * @returns {Game} game
     */

    async acceptJoinRequest(waitingGameId: string, playerId: string, opponentName: string): Promise<Game> {
        const waitingGame = this.getGameFromId(waitingGameId);

        if (waitingGame.getConfig().player.getId() !== playerId) {
            throw new Error(Errors.INVALID_PLAYER_ID_FOR_GAME);
        } else if (waitingGame.joinedPlayer === undefined) {
            throw new Error(GameDispatcherError.NO_OPPONENT_IN_WAITING_GAME);
        } else if (waitingGame.joinedPlayer.name !== opponentName) {
            throw new Error(GameDispatcherError.OPPONENT_NAME_DOES_NOT_MATCH);
        }

        // Remove game from wait
        const index = this.waitingGames.indexOf(waitingGame);
        this.waitingGames.splice(index, 1);

        // Start game
        const config: MultiplayerGameConfig = {
            ...waitingGame.getConfig(),
            player2: waitingGame.joinedPlayer,
        };
        return this.activeGameService.beginMultiplayerGame(waitingGame.getId(), config);
    }

    /**
     * Reject a player trying to join your game
     *
     * @param waitingGameId Id of the game in the lobby
     * @param playerId Id of the initiating player
     * @param opponentName Opponent name
     */

    rejectJoinRequest(waitingGameId: string, playerId: string, opponentName: string) {
        const waitingGame = this.getGameFromId(waitingGameId);

        if (waitingGame.getConfig().player.getId() !== playerId) {
            throw new Error(Errors.INVALID_PLAYER_ID_FOR_GAME);
        } else if (waitingGame.joinedPlayer === undefined) {
            throw new Error(GameDispatcherError.NO_OPPONENT_IN_WAITING_GAME);
        } else if (waitingGame.joinedPlayer.name !== opponentName) {
            throw new Error(GameDispatcherError.OPPONENT_NAME_DOES_NOT_MATCH);
        }

        waitingGame.joinedPlayer = undefined;
    }

    /**
     * Let initiating player cancel a game
     *
     * @param waitingGameId Id of the game in the lobby
     * @param playerId Id of the initiating player
     */

    cancelGame(waitingGameId: string, playerId: string) {
        const waitingGame = this.getGameFromId(waitingGameId);

        if (waitingGame.getConfig().player.getId() !== playerId) {
            throw new Error(Errors.INVALID_PLAYER_ID_FOR_GAME);
        }

        // Remove game from wait
        const index = this.waitingGames.indexOf(waitingGame);
        this.waitingGames.splice(index, 1);
    }

    /**
     * Get all available lobby that the player can join
     *
     * @returns {WaitingGame[]} list of available lobby
     */

    getAvailableWaitingGames() {
        return this.waitingGames.filter((g) => g.joinedPlayer === undefined);
    }

    private getGameFromId(waitingGameId: string): WaitingGame {
        const filteredWaitingGame = this.waitingGames.filter((g) => g.getId() === waitingGameId);
        if (filteredWaitingGame.length > 0) return filteredWaitingGame[0];
        throw new Error(Errors.NO_GAME_FOUND_WITH_ID);
    }
}
