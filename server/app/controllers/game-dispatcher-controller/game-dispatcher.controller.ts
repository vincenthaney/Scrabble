import { CreateGameRequest, GameRequest, LobbiesRequest } from '@app/classes/communication/request';
import { GameConfigData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http.exception';
import {
    DICTIONARY_REQUIRED,
    GAME_TYPE_REQUIRED,
    MAX_ROUND_TIME_REQUIRED,
    NAME_IS_INVALID,
    PLAYER_NAME_REQUIRED,
} from '@app/constants/controllers-errors';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { validateName } from '@app/utils/validate-name';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameDispatcherController {
    router: Router;

    constructor(
        private readonly activeGameService: ActiveGameService,
        private readonly gameDispatcherService: GameDispatcherService,
        private readonly socketService: SocketService,
    ) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/games/:playerId', (req: CreateGameRequest, res: Response) => {
            const { playerId } = req.params;
            const body: Omit<GameConfigData, 'playerId'> = req.body;

            try {
                const gameId = this.handleCreateGame({ playerId, ...body });

                res.status(StatusCodes.CREATED).send({ gameId });
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.get('/games/:playerId', (req: LobbiesRequest, res: Response) => {
            const { playerId } = req.params;
            try {
                this.handleLobbiesRequest(playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.post('/games/:gameId/player/:playerId/join', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { playerName }: { playerName: string } = req.body;

            try {
                this.handleJoinGame(gameId, playerId, playerName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.post('/games/:gameId/player/:playerId/accept', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;

            try {
                this.handleAcceptRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.post('/games/:gameId/player/:playerId/reject', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;

            try {
                this.handleRejectRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.delete('/games/:gameId/player/:playerId/cancel', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleCancelGame(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.delete('/games/:gameId/player/:playerId/leave', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;

            try {
                this.handleLeave(gameId, playerId);

                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });
    }

    private handleCancelGame(gameId: string, playerId: string) {
        const waitingRoom = this.gameDispatcherService.getGameFromId(gameId);
        if (waitingRoom.joinedPlayer) {
            this.socketService.emitToSocket(waitingRoom.joinedPlayer.getId(), 'canceledGame', { name: waitingRoom.getConfig().player1.name });
        }
        this.gameDispatcherService.cancelGame(gameId, playerId);

        this.handleLobbiesUpdate();
    }

    private handleLeave(gameId: string, playerId: string) {
        if (this.gameDispatcherService.isGameInWaitingRooms(gameId)) {
            const result = this.gameDispatcherService.leaveLobbyRequest(gameId, playerId);
            this.socketService.emitToSocket(result[0], 'joinerLeaveGame', { name: result[1] });
            this.handleLobbiesUpdate();
        }
    }

    private handleCreateGame(config: GameConfigData): string {
        if (config.playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.gameType === undefined) throw new HttpException(GAME_TYPE_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.maxRoundTime === undefined) throw new HttpException(MAX_ROUND_TIME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.dictionary === undefined) throw new HttpException(DICTIONARY_REQUIRED, StatusCodes.BAD_REQUEST);

        if (!validateName(config.playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);

        const gameId = this.gameDispatcherService.createMultiplayerGame(config);

        this.socketService.addToRoom(config.playerId, gameId);
        this.handleLobbiesUpdate();
        return gameId;
    }

    private handleJoinGame(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (!validateName(playerName)) throw new HttpException(NAME_IS_INVALID, StatusCodes.BAD_REQUEST);
        this.gameDispatcherService.requestJoinGame(gameId, playerId, playerName);
        this.socketService.emitToRoom(gameId, 'joinRequest', { name: playerName });

        this.socketService.getSocket(playerId).leave(this.gameDispatcherService.getLobbiesRoom().getId());
        this.handleLobbiesUpdate();
    }

    private async handleAcceptRequest(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);

        const gameConfig = await this.gameDispatcherService.acceptJoinRequest(gameId, playerId, playerName);
        const startGameData = await this.activeGameService.beginMultiplayerGame(gameId, gameConfig);

        this.socketService.addToRoom(startGameData.player2.getId(), gameId);
        this.socketService.emitToRoom(gameId, 'startGame', startGameData);
    }

    private handleRejectRequest(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        const [rejectedPlayer, hostName] = this.gameDispatcherService.rejectJoinRequest(gameId, playerId, playerName);
        this.socketService.emitToSocket(rejectedPlayer.getId(), 'rejected', { name: hostName });
        this.handleLobbiesUpdate();
    }

    private handleLobbiesRequest(playerId: string) {
        const waitingRooms = this.gameDispatcherService.getAvailableWaitingRooms();
        this.socketService.addToRoom(playerId, this.gameDispatcherService.getLobbiesRoom().getId());
        this.socketService.emitToSocket(playerId, 'lobbiesUpdate', waitingRooms);
    }

    private handleLobbiesUpdate() {
        const waitingRooms = this.gameDispatcherService.getAvailableWaitingRooms();
        this.socketService.emitToRoom(this.gameDispatcherService.getLobbiesRoom().getId(), 'lobbiesUpdate', waitingRooms);
    }
}
