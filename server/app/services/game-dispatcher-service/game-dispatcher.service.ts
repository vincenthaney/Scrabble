import { LobbyData } from '@app/classes/communication/lobby-data';
import { RoundData } from '@app/classes/communication/round-data';
import Game from '@app/classes/game/game';
import { GameConfig, GameConfigData, MultiplayerGameConfig, StartMultiplayerGameData } from '@app/classes/game/game-config';
import Room from '@app/classes/game/room';
import WaitingRoom from '@app/classes/game/waiting-room';
import { HttpException } from '@app/classes/http.exception';
import Player from '@app/classes/player/player';
import { Round } from '@app/classes/round/round';
import { LetterValue, TileReserveData } from '@app/classes/tile/tile.types';
import * as Errors from '@app/constants/errors';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import * as GameDispatcherError from './game-dispatcher.service.error';

@Service()
export class GameDispatcherService {
    private waitingRooms: WaitingRoom[];
    private lobbiesRoom: Room;

    constructor(private activeGameService: ActiveGameService) {
        this.waitingRooms = [];
        this.lobbiesRoom = new Room();
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

    getLobbiesRoom() {
        return this.lobbiesRoom;
    }

    requestJoinGame(waitingRoomId: string, playerId: string, playerName: string) {
        const waitingRoom = this.getGameFromId(waitingRoomId);
        if (waitingRoom.joinedPlayer !== undefined) {
            throw new HttpException(GameDispatcherError.PLAYER_ALREADY_TRYING_TO_JOIN, StatusCodes.UNAUTHORIZED);
        }
        if (waitingRoom.getConfig().player1.name === playerName) {
            throw new HttpException(GameDispatcherError.CANNOT_HAVE_SAME_NAME);
        }

        const joiningPlayer = new Player(playerId, playerName);
        waitingRoom.joinedPlayer = joiningPlayer;
        return waitingRoom.getConfig();
    }

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
        await createdGame.tileReserve.init();

        return this.createStartGameData(createdGame);
    }

    rejectJoinRequest(waitingRoomId: string, playerId: string, opponentName: string): [Player, string] {
        const waitingRoom = this.getGameFromId(waitingRoomId);

        if (waitingRoom.getConfig().player1.getId() !== playerId) {
            throw new HttpException(Errors.INVALID_PLAYER_ID_FOR_GAME);
        } else if (waitingRoom.joinedPlayer === undefined) {
            throw new HttpException(GameDispatcherError.NO_OPPONENT_IN_WAITING_GAME);
        } else if (waitingRoom.joinedPlayer.name !== opponentName) {
            throw new HttpException(GameDispatcherError.OPPONENT_NAME_DOES_NOT_MATCH);
        }

        const rejectedPlayer = waitingRoom.joinedPlayer;
        waitingRoom.joinedPlayer = undefined;
        return [rejectedPlayer, waitingRoom.getConfig().player1.name];
    }

    leaveLobbyRequest(waitingRoomId: string, playerId: string): [string, string] {
        const waitingRoom = this.getGameFromId(waitingRoomId);
        if (waitingRoom.joinedPlayer === undefined) {
            throw new HttpException(GameDispatcherError.NO_OPPONENT_IN_WAITING_GAME);
        } else if (waitingRoom.joinedPlayer.getId() !== playerId) {
            throw new HttpException(Errors.INVALID_PLAYER_ID_FOR_GAME);
        }
        const leaverName = waitingRoom.joinedPlayer.name;
        const hostPlayerId = waitingRoom.getConfig().player1.getId();

        waitingRoom.joinedPlayer = undefined;
        return [hostPlayerId, leaverName];
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

    getGameFromId(waitingRoomId: string): WaitingRoom {
        const filteredWaitingRoom = this.waitingRooms.filter((g) => g.getId() === waitingRoomId);
        if (filteredWaitingRoom.length > 0) return filteredWaitingRoom[0];
        throw new HttpException(Errors.NO_GAME_FOUND_WITH_ID, StatusCodes.GONE);
    }

    private createStartGameData(createdGame: Game): StartMultiplayerGameData {
        const tileReserve: TileReserveData[] = [];
        createdGame.tileReserve.getTilesLeftPerLetter().forEach((amount: number, letter: LetterValue) => {
            tileReserve.push({ letter, amount });
        });
        const tileReserveTotal = tileReserve.reduce((prev, { amount }) => (prev += amount), 0);
        const round: Round = createdGame.roundManager.getCurrentRound();
        const roundData: RoundData = createdGame.roundManager.convertRoundToRoundData(round);
        const startMultiplayerGameData: StartMultiplayerGameData = {
            player1: createdGame.player1,
            player2: createdGame.player2,
            gameType: createdGame.gameType,
            maxRoundTime: createdGame.roundManager.getMaxRoundTime(),
            dictionary: createdGame.dictionnaryName,
            gameId: createdGame.getId(),
            board: createdGame.board.grid,
            tileReserve,
            tileReserveTotal,
            round: roundData,
        };
        return startMultiplayerGameData;
    }
}
