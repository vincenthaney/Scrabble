import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { CreateGameRequest, GameRequest, LobbiesRequest } from '@app/classes/communication/request';
import { GameConfigData } from '@app/classes/game/game-config';
import { GameMode } from '@app/classes/game/game-mode';
import { HttpException } from '@app/classes/http.exception';
import { SECONDS_TO_MILLISECONDS, TIME_TO_RECONNECT } from '@app/constants/controllers-constants';
import {
    DICTIONARY_REQUIRED,
    GAME_IS_OVER,
    GAME_MODE_REQUIRED,
    GAME_TYPE_REQUIRED,
    MAX_ROUND_TIME_REQUIRED,
    NAME_IS_INVALID,
    PLAYER_LEFT_GAME,
    PLAYER_NAME_REQUIRED,
    VIRTUAL_PLAYER_LEVEL_REQUIRED,
    VIRTUAL_PLAYER_NAME_REQUIRED,
} from '@app/constants/controllers-errors';
import { IS_REQUESTING, SYSTEM_ID } from '@app/constants/game';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { CreateGameService } from '@app/services/create-game-service/create-game.service';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { validateName } from '@app/utils/validate-name';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
@Service()
export class GameDispatcherController {
    router: Router;

    constructor(
        private gameDispatcherService: GameDispatcherService,
        private socketService: SocketService,
        private activeGameService: ActiveGameService,
        private createGameService: CreateGameService,
        private virtualPlayerService: VirtualPlayerService,
    ) {
        this.configureRouter();
        this.activeGameService.playerLeftEvent.on(
            'playerLeftFeedback',
            (gameId: string, endOfGameMessages: string[], updatedData: GameUpdateData) => {
                this.handlePlayerLeftFeedback(gameId, endOfGameMessages, updatedData);
            },
        );
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/games/:playerId', async (req: CreateGameRequest, res: Response) => {
            const { playerId } = req.params;
            const body: Omit<GameConfigData, 'playerId'> = req.body;

            try {
                const gameId = await this.handleCreateGame({ playerId, ...body });
                res.status(StatusCodes.CREATED).send({ gameId });
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.get('/games/:playerId', (req: LobbiesRequest, res: Response) => {
            const { playerId } = req.params;
            try {
                this.handleLobbiesRequest(playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.post('/games/:gameId/players/:playerId/join', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { playerName }: { playerName: string } = req.body;

            try {
                this.handleJoinGame(gameId, playerId, playerName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.post('/games/:gameId/players/:playerId/accept', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;

            try {
                this.handleAcceptRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.post('/games/:gameId/players/:playerId/reject', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;

            try {
                this.handleRejectRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/games/:gameId/players/:playerId/cancel', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleCancelGame(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/games/:gameId/players/:playerId/leave', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleLeave(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.post('/games/:gameId/players/:playerId/reconnect', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { newPlayerId }: { newPlayerId: string } = req.body;

            try {
                this.handleReconnection(gameId, playerId, newPlayerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/games/:gameId/players/:playerId/disconnect', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleDisconnection(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });
    }

    private handleCancelGame(gameId: string, playerId: string): void {
        const waitingRoom = this.gameDispatcherService.getMultiplayerGameFromId(gameId);
        if (waitingRoom.joinedPlayer) {
            this.socketService.emitToSocket(waitingRoom.joinedPlayer.id, 'canceledGame', { name: waitingRoom.getConfig().player1.name });
        }
        this.gameDispatcherService.cancelGame(gameId, playerId);

        this.handleLobbiesUpdate();
    }

    private handleLeave(gameId: string, playerId: string): void {
        if (this.gameDispatcherService.isGameInWaitingRooms(gameId)) {
            const result = this.gameDispatcherService.leaveLobbyRequest(gameId, playerId);
            this.socketService.emitToSocket(result[0], 'joinerLeaveGame', { name: result[1] });
            this.handleLobbiesUpdate();
            return;
        }
        // Check if there is no player left --> cleanup server and client
        if (!this.socketService.doesRoomExist(gameId)) {
            this.activeGameService.removeGame(gameId, playerId);
            return;
        }
        try {
            this.socketService.removeFromRoom(playerId, gameId);
            this.socketService.emitToSocket(playerId, 'cleanup');
            // catch errors caused by inexistent socket after client closed application
            // eslint-disable-next-line no-empty
        } catch (exception) {}
        const playerName = this.activeGameService.getGame(gameId, playerId).getPlayer(playerId, IS_REQUESTING).name;

        this.socketService.emitToRoom(gameId, 'newMessage', { content: `${playerName} ${PLAYER_LEFT_GAME}`, senderId: 'system' });

        if (this.activeGameService.isGameOver(gameId, playerId)) return;

        this.activeGameService.playerLeftEvent.emit('playerLeft', gameId, playerId);
    }

    private handlePlayerLeftFeedback(gameId: string, endOfGameMessages: string[], updatedData: GameUpdateData): void {
        this.socketService.emitToRoom(gameId, 'gameUpdate', updatedData);
        for (const message of endOfGameMessages) {
            this.socketService.emitToRoom(gameId, 'newMessage', {
                content: message,
                senderId: SYSTEM_ID,
            });
        }
    }

    private async handleCreateGame(config: GameConfigData): Promise<string> {
        if (config.playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.gameType === undefined) throw new HttpException(GAME_TYPE_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.gameMode === undefined) throw new HttpException(GAME_MODE_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.maxRoundTime === undefined) throw new HttpException(MAX_ROUND_TIME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.dictionary === undefined) throw new HttpException(DICTIONARY_REQUIRED, StatusCodes.BAD_REQUEST);

        if (!validateName(config.playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);

        let gameId: string;
        if (config.gameMode === GameMode.Multiplayer) {
            const waitingRoom = this.createGameService.createMultiplayerGame(config);
            gameId = waitingRoom.getId();
            this.gameDispatcherService.addToWaitingRoom(waitingRoom);
            this.socketService.addToRoom(config.playerId, gameId);
            this.handleLobbiesUpdate();
        } else {
            if (config.virtualPlayerName === undefined) throw new HttpException(VIRTUAL_PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
            if (config.virtualPlayerLevel === undefined) throw new HttpException(VIRTUAL_PLAYER_LEVEL_REQUIRED, StatusCodes.BAD_REQUEST);
            const startGameData = await this.createGameService.createSoloGame(config);
            gameId = startGameData.gameId;
            this.socketService.addToRoom(config.playerId, gameId);

            startGameData.player2 = this.virtualPlayerService.sliceVirtualPlayerToPlayer(startGameData.player2);

            this.socketService.emitToSocket(config.playerId, 'startGame', startGameData);

            if (VirtualPlayerService.isIdVirtualPlayer(startGameData.round.playerData.id)) {
                this.virtualPlayerService.triggerVirtualPlayerTurn(
                    startGameData,
                    this.activeGameService.getGame(gameId, startGameData.round.playerData.id),
                );
            }
        }
        return gameId;
    }

    private handleJoinGame(gameId: string, playerId: string, playerName: string): void {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (!validateName(playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);
        this.gameDispatcherService.requestJoinGame(gameId, playerId, playerName);
        this.socketService.emitToRoom(gameId, 'joinRequest', { name: playerName });

        this.socketService.getSocket(playerId).leave(this.gameDispatcherService.getLobbiesRoom().getId());
        this.handleLobbiesUpdate();
    }

    private async handleAcceptRequest(gameId: string, playerId: string, playerName: string): Promise<void> {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        const gameConfig = await this.gameDispatcherService.acceptJoinRequest(gameId, playerId, playerName);
        const startGameData = await this.activeGameService.beginGame(gameId, gameConfig);

        this.socketService.addToRoom(startGameData.player2.id, gameId);
        this.socketService.emitToRoom(gameId, 'startGame', startGameData);
    }

    private handleRejectRequest(gameId: string, playerId: string, playerName: string): void {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        const [rejectedPlayer, hostName] = this.gameDispatcherService.rejectJoinRequest(gameId, playerId, playerName);
        this.socketService.emitToSocket(rejectedPlayer.id, 'rejected', { name: hostName });
        this.handleLobbiesUpdate();
    }

    private handleLobbiesRequest(playerId: string): void {
        const waitingRooms = this.gameDispatcherService.getAvailableWaitingRooms();
        this.socketService.addToRoom(playerId, this.gameDispatcherService.getLobbiesRoom().getId());
        this.socketService.emitToSocket(playerId, 'lobbiesUpdate', waitingRooms);
    }

    private handleLobbiesUpdate(): void {
        const waitingRooms = this.gameDispatcherService.getAvailableWaitingRooms();
        this.socketService.emitToRoom(this.gameDispatcherService.getLobbiesRoom().getId(), 'lobbiesUpdate', waitingRooms);
    }

    private handleReconnection(gameId: string, playerId: string, newPlayerId: string): void {
        const game = this.activeGameService.getGame(gameId, playerId);

        // TODO: Add condition once we have singleplayer games
        // if (!game.isGameOver()&& game.gameMode === gameMode.multiplayer)
        if (game.isGameOver()) {
            throw new HttpException(GAME_IS_OVER, StatusCodes.FORBIDDEN);
        }
        const player = game.getPlayer(playerId, IS_REQUESTING);
        player.id = newPlayerId;
        player.isConnected = true;
        this.socketService.addToRoom(newPlayerId, gameId);

        const data = game.createStartGameData();
        this.socketService.emitToSocket(newPlayerId, 'startGame', data);
    }

    private handleDisconnection(gameId: string, playerId: string): void {
        const game = this.activeGameService.getGame(gameId, playerId);
        // TODO: Add condition once we have singleplayer games
        // if (!game.isGameOver()&& game.gameMode === gameMode.multiplayer)
        if (!game.isGameOver()) {
            const disconnectedPlayer = game.getPlayer(playerId, IS_REQUESTING);
            disconnectedPlayer.isConnected = false;
            setTimeout(() => {
                if (!disconnectedPlayer.isConnected) {
                    this.handleLeave(gameId, playerId);
                }
            }, TIME_TO_RECONNECT * SECONDS_TO_MILLISECONDS);
        }
    }
}
