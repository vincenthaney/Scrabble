import Game from '@app/classes/game/game';
import { GameConfig, GameConfigData, MultiplayerGameConfig, StartMultiplayerGameData } from '@app/classes/game/game-config';
import WaitingRoom from '@app/classes/game/waiting-game';
import { HttpException } from '@app/classes/http.exception';
import Player from '@app/classes/player/player';
import { LetterValue, TileReserveData } from '@app/classes/tile/tile.types';
import * as Errors from '@app/constants/errors';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import * as GameDispatcherError from './game-dispatcher.service.error';

@Service()
export class GameDispatcherService {
    private waitingRooms: WaitingRoom[];

    constructor(private activeGameService: ActiveGameService) {
        this.waitingRooms = [];
    }

    /**
     * Add the configuration into the waiting game list
     *
     * @param {GameConfigData} configData Necessary information to create the game
     * @return {string} Waiting game id
     */

    createMultiplayerGame(configData: GameConfigData): string {
        const config: GameConfig = {
            player1: new Player(configData.playerId, configData.playerName),
            gameType: configData.gameType,
            maxRoundTime: configData.maxRoundTime,
            dictionary: configData.dictionary,
        };
        const waitingRoom = new WaitingRoom(config);
        this.waitingRooms.push(waitingRoom);

        return waitingRoom.getId();
    }

    /**
     * The second player ask the initiating player to join their game
     *
     * @param {string} waitingRoomId Id of the game in the lobby
     * @param playerId Id of the player asking to join
     * @param playerName Name the player want to use
     */

    requestJoinGame(waitingRoomId: string, playerId: string, playerName: string) {
        const waitingRoom = this.getGameFromId(waitingRoomId);

        if (waitingRoom.joinedPlayer !== undefined) {
            throw new HttpException(GameDispatcherError.PLAYER_ALREADY_TRYING_TO_JOIN);
        }
        if (waitingRoom.getConfig().player1.name === playerName) {
            throw new HttpException(GameDispatcherError.CANNOT_HAVE_SAME_NAME);
        }

        const joiningPlayer = new Player(playerId, playerName);
        waitingRoom.joinedPlayer = joiningPlayer;
    }

    /**
     * The initiating player accept their opponent and the game starts
     *
     * @param waitingRoomId Id of the game in the lobby
     * @param playerId Id of the initiating player
     * @param opponentName Opponent name
     * @returns {Game} game
     */

    async acceptJoinRequest(waitingRoomId: string, playerId: string, opponentName: string): Promise<StartMultiplayerGameData> {
        const waitingRoom = this.getGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.getId() !== playerId) {
            throw new HttpException(Errors.INVALID_PLAYER_ID_FOR_GAME);
        } else if (waitingRoom.joinedPlayer === undefined) {
            throw new HttpException(GameDispatcherError.NO_OPPONENT_IN_WAITING_GAME);
        } else if (waitingRoom.joinedPlayer.name !== opponentName) {
            throw new HttpException(GameDispatcherError.OPPONENT_NAME_DOES_NOT_MATCH);
        }

        // Remove game from wait
        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);

        // Start game
        const config: MultiplayerGameConfig = {
            ...waitingRoom.getConfig(),
            player2: waitingRoom.joinedPlayer,
        };

        const createdGame = await this.activeGameService.beginMultiplayerGame(waitingRoom.getId(), config);

        return this.createStartGameData(createdGame);
    }

    /**
     * Reject a player trying to join your game
     *
     * @param waitingRoomId Id of the game in the lobby
     * @param playerId Id of the initiating player
     * @param opponentName Opponent name
     * @return rejected player id
     */

    rejectJoinRequest(waitingRoomId: string, playerId: string, opponentName: string): string {
        const waitingRoom = this.getGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.getId() !== playerId) {
            throw new HttpException(Errors.INVALID_PLAYER_ID_FOR_GAME);
        } else if (waitingRoom.joinedPlayer === undefined) {
            throw new HttpException(GameDispatcherError.NO_OPPONENT_IN_WAITING_GAME);
        } else if (waitingRoom.joinedPlayer.name !== opponentName) {
            throw new HttpException(GameDispatcherError.OPPONENT_NAME_DOES_NOT_MATCH);
        }

        const rejectedPlayerId = waitingRoom.joinedPlayer.getId();
        waitingRoom.joinedPlayer = undefined;
        return rejectedPlayerId;
    }

    /**
     * Let initiating player cancel a game
     *
     * @param waitingRoomId Id of the game in the lobby
     * @param playerId Id of the initiating player
     */

    cancelGame(waitingRoomId: string, playerId: string) {
        const waitingRoom = this.getGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.getId() !== playerId) {
            throw new HttpException(Errors.INVALID_PLAYER_ID_FOR_GAME, StatusCodes.BAD_REQUEST);
        }

        // Remove game from wait
        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);
    }

    /**
     * Get all available lobby that the player can join
     *
     * @returns {WaitingRoom[]} list of available lobby
     */

    getAvailableWaitingRooms() {
        return this.waitingRooms.filter((g) => g.joinedPlayer === undefined);
    }

    private getGameFromId(waitingRoomId: string): WaitingRoom {
        const filteredWaitingRoom = this.waitingRooms.filter((g) => g.getId() === waitingRoomId);
        if (filteredWaitingRoom.length > 0) return filteredWaitingRoom[0];
        throw new HttpException(Errors.NO_GAME_FOUND_WITH_ID);
    }

    private createStartGameData(createdGame: Game): StartMultiplayerGameData {
        const tileReserve: TileReserveData[] = [];
        createdGame.tileReserve.getTilesLeftPerLetter().forEach((amount: number, letter: LetterValue) => {
            tileReserve.push({ letter, amount });
        });
        const startMultiplayerGameData: StartMultiplayerGameData = {
            player1: createdGame.player1,
            player2: createdGame.player2,
            gameType: createdGame.gameType,
            maxRoundTime: createdGame.roundManager.getMaxRoundTime(),
            dictionary: createdGame.dictionnaryName,
            gameId: createdGame.getId(),
            board: createdGame.board.grid,
            tileReserve,
            round: createdGame.roundManager.getCurrentRound(),
        };
        return startMultiplayerGameData;
    }
}
