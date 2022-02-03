import { CreateGameRequest, GameRequest } from '@app/classes/communication/request';
import { GameConfigData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http.exception';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Router, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { DICTIONARY_REQUIRED, GAME_TYPE_REQUIRED, MAX_ROUND_TIME_REQUIRED, PLAYER_NAME_REQUIRED } from './game-dispatcher-error';

@Service()
export class GameDispatcherController {
    router: Router;

    constructor(private readonly gameDispatcherService: GameDispatcherService, private readonly socketService: SocketService) {
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
    }

    private handleCreateGame(config: GameConfigData): string {
        if (config.playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.gameType === undefined) throw new HttpException(GAME_TYPE_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.maxRoundTime === undefined) throw new HttpException(MAX_ROUND_TIME_REQUIRED, StatusCodes.BAD_REQUEST);
        if (config.dictionary === undefined) throw new HttpException(DICTIONARY_REQUIRED, StatusCodes.BAD_REQUEST);

        const gameId = this.gameDispatcherService.createMultiplayerGame(config);

        this.socketService.addToRoom(config.playerId, gameId);

        return gameId;
    }

    private handleJoinGame(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);

        this.gameDispatcherService.requestJoinGame(gameId, playerId, playerName);

        this.socketService.emitToRoom(gameId, 'joinRequest', { opponentName: playerName });
    }

    private async handleAcceptRequest(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);

        const game = await this.gameDispatcherService.acceptJoinRequest(gameId, playerId, playerName);

        this.socketService.addToRoom(game.player2.getId(), gameId);
        this.socketService.emitToRoom(gameId, 'startGame', game);
    }

    private handleRejectRequest(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException(PLAYER_NAME_REQUIRED, StatusCodes.BAD_REQUEST);

        const rejectedPlayerId = this.gameDispatcherService.rejectJoinRequest(gameId, playerId, playerName);

        this.socketService.emitToSocket(rejectedPlayerId, 'rejected');
    }
}
