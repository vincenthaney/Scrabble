import { GameConfig, GameConfigData, MultiplayerGameConfig } from '@app/classes/game/game-config';
import WaitingRoom from '@app/classes/game/waiting-game';
import { Service } from 'typedi';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import Player from '@app/classes/player/player';
import * as GameDispatcherError from './game-dispatcher.service.error';
import * as Errors from '@app/constants/errors';
import Game from '@app/classes/game/game';
import { HttpException } from '@app/classes/http.exception';
import { StatusCodes } from 'http-status-codes';

@Service()
export class GameDispatcherService {
    private waitingRooms: WaitingRoom[];

    constructor(private activeGameService: ActiveGameService) {
        this.waitingRooms = [];
    }

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

    async acceptJoinRequest(waitingRoomId: string, playerId: string, opponentName: string): Promise<Game> {
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

        return this.activeGameService.beginMultiplayerGame(waitingRoom.getId(), config);
    }

    rejectJoinRequest(waitingRoomId: string, playerId: string, opponentName: string) {
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

    cancelGame(waitingRoomId: string, playerId: string) {
        const waitingRoom = this.getGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.getId() !== playerId) {
            throw new HttpException(Errors.INVALID_PLAYER_ID_FOR_GAME, StatusCodes.BAD_REQUEST);
        }

        // Remove game from wait
        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);
    }

    getAvailableWaitingRooms() {
        return this.waitingRooms.filter((g) => g.joinedPlayer === undefined);
    }

    private getGameFromId(waitingRoomId: string): WaitingRoom {
        const filteredWaitingRoom = this.waitingRooms.filter((g) => g.getId() === waitingRoomId);
        if (filteredWaitingRoom.length > 0) return filteredWaitingRoom[0];
        throw new HttpException(Errors.NO_GAME_FOUND_WITH_ID);
    }
}
