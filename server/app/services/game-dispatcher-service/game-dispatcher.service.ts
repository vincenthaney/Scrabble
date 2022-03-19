import { LobbyData } from '@app/classes/communication/lobby-data';
import { GameConfig, ReadyGameConfig } from '@app/classes/game/game-config';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import { HttpException } from '@app/classes/http.exception';
import Player from '@app/classes/player/player';
import {
    CANNOT_HAVE_SAME_NAME,
    INVALID_PLAYER_ID_FOR_GAME,
    NO_GAME_FOUND_WITH_ID,
    NO_OPPONENT_IN_WAITING_GAME,
    OPPONENT_NAME_DOES_NOT_MATCH,
    PLAYER_ALREADY_TRYING_TO_JOIN,
} from '@app/constants/services-errors';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameDispatcherService {
    private waitingRooms: WaitingRoom[];
    private lobbiesRoom: Room;

    constructor() {
        this.waitingRooms = [];
        this.lobbiesRoom = new Room();
    }

    addToWaitingRoom(waitingRoom: WaitingRoom): void {
        this.waitingRooms.push(waitingRoom);
    }

    getLobbiesRoom(): Room {
        return this.lobbiesRoom;
    }

    requestJoinGame(waitingRoomId: string, playerId: string, playerName: string): GameConfig {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.joinedPlayer !== undefined) {
            throw new HttpException(PLAYER_ALREADY_TRYING_TO_JOIN, StatusCodes.UNAUTHORIZED);
        }
        if (waitingRoom.getConfig().player1.name === playerName) {
            throw new HttpException(CANNOT_HAVE_SAME_NAME);
        }

        const joiningPlayer = new Player(playerId, playerName);
        waitingRoom.joinedPlayer = joiningPlayer;
        return waitingRoom.getConfig();
    }

    async acceptJoinRequest(waitingRoomId: string, playerId: string, opponentName: string): Promise<ReadyGameConfig> {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME);
        } else if (waitingRoom.joinedPlayer === undefined) {
            throw new HttpException(NO_OPPONENT_IN_WAITING_GAME);
        } else if (waitingRoom.joinedPlayer.name !== opponentName) {
            throw new HttpException(OPPONENT_NAME_DOES_NOT_MATCH);
        }

        // Remove game from wait
        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);

        // Start game
        const config: ReadyGameConfig = {
            ...waitingRoom.getConfig(),
            player2: waitingRoom.joinedPlayer,
        };

        return config;
    }

    rejectJoinRequest(waitingRoomId: string, playerId: string, opponentName: string): [Player, string] {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME);
        } else if (waitingRoom.joinedPlayer === undefined) {
            throw new HttpException(NO_OPPONENT_IN_WAITING_GAME);
        } else if (waitingRoom.joinedPlayer.name !== opponentName) {
            throw new HttpException(OPPONENT_NAME_DOES_NOT_MATCH);
        }

        const rejectedPlayer = waitingRoom.joinedPlayer;
        waitingRoom.joinedPlayer = undefined;
        return [rejectedPlayer, waitingRoom.getConfig().player1.name];
    }

    leaveLobbyRequest(waitingRoomId: string, playerId: string): [string, string] {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);
        if (waitingRoom.joinedPlayer === undefined) {
            throw new HttpException(NO_OPPONENT_IN_WAITING_GAME);
        } else if (waitingRoom.joinedPlayer.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME);
        }
        const leaverName = waitingRoom.joinedPlayer.name;
        const hostPlayerId = waitingRoom.getConfig().player1.id;

        waitingRoom.joinedPlayer = undefined;
        return [hostPlayerId, leaverName];
    }

    cancelGame(waitingRoomId: string, playerId: string): void {
        const waitingRoom = this.getMultiplayerGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.id !== playerId) {
            throw new HttpException(INVALID_PLAYER_ID_FOR_GAME, StatusCodes.BAD_REQUEST);
        }

        // Remove game from wait
        const index = this.waitingRooms.indexOf(waitingRoom);
        this.waitingRooms.splice(index, 1);
    }

    getAvailableWaitingRooms(): LobbyData[] {
        const waitingRooms = this.waitingRooms.filter((g) => g.joinedPlayer === undefined);
        const lobbyData: LobbyData[] = [];
        for (const room of waitingRooms) {
            const config = room.getConfig();
            lobbyData.push({
                dictionary: config.dictionary,
                playerName: config.player1.name,
                maxRoundTime: config.maxRoundTime,
                lobbyId: room.getId(),
                gameType: config.gameType,
            });
        }

        return lobbyData;
    }

    getMultiplayerGameFromId(waitingRoomId: string): WaitingRoom {
        const filteredWaitingRoom = this.waitingRooms.filter((g) => g.getId() === waitingRoomId);
        if (filteredWaitingRoom.length > 0) return filteredWaitingRoom[0];
        throw new HttpException(NO_GAME_FOUND_WITH_ID, StatusCodes.GONE);
    }

    isGameInWaitingRooms(gameId: string): boolean {
        const filteredWaitingRoom = this.waitingRooms.filter((g) => g.getId() === gameId);
        return filteredWaitingRoom.length > 0;
    }
}
