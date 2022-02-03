import { CreateGameRequest, GameRequest } from '@app/classes/communication/request';
import { GameConfigData } from '@app/classes/game/game-config';
import { HttpException } from '@app/classes/http.exception';
import { JOIN_REQUEST, REJECTED, START_GAME } from '@app/constants/communication';
import { GameDispatcherService } from '@app/services/game-dispatcher-service/game-dispatcher.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Router, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameDispatcherController {
    router: Router;

    constructor(private readonly gameDispatcherService: GameDispatcherService, private readonly socketService: SocketService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/game/:playerId', (req: CreateGameRequest, res: Response) => {
            const { playerId } = req.params;
            const body: Omit<GameConfigData, 'playerId'> = req.body;

            try {
                const gameId = this.handleCreateGame({ playerId, ...body });

                return res.status(StatusCodes.CREATED).send({ gameId });
            } catch (e) {
                return res.status(StatusCodes.BAD_REQUEST).send(e);
            }
        });

        this.router.post('/game/:gameId/player/:playerId/join', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { playerName }: { playerName: string } = req.body;

            try {
                this.handleJoinGame(gameId, playerId, playerName);

                return res.status(StatusCodes.CREATED).send();
            } catch (e) {
                return res.status(StatusCodes.BAD_REQUEST).send(e);
            }
        });

        this.router.post('/game/:gameId/player/:playerId/accept', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;

            try {
                this.handleAcceptRequest(gameId, playerId, opponentName);

                return res.status(StatusCodes.CREATED).send({ ok: true });
            } catch (e) {
                return res.status(StatusCodes.BAD_REQUEST).send(e);
            }
        });

        this.router.post('/game/:gameId/player/:playerId/reject', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const { opponentName }: { opponentName: string } = req.body;

            try {
                this.handleRejectRequest(gameId, playerId, opponentName);

                res.status(StatusCodes.CREATED).send({ ok: true });
            } catch (e) {
                res.status(StatusCodes.BAD_REQUEST).send(e);
            }
        });
    }

    private handleCreateGame(config: GameConfigData): string {
        if (config.playerName === undefined) throw new HttpException('playerName required', StatusCodes.BAD_REQUEST);
        if (config.gameType === undefined) throw new HttpException('gameType required', StatusCodes.BAD_REQUEST);
        if (config.maxRoundTime === undefined) throw new HttpException('maxRoundTime required', StatusCodes.BAD_REQUEST);
        if (config.dictionary === undefined) throw new HttpException('dictionary required', StatusCodes.BAD_REQUEST);

        const gameId = this.gameDispatcherService.createMultiplayerGame(config);

        this.socketService.addToRoom(config.playerId, gameId);

        return gameId;
    }

    private handleJoinGame(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException('playerName required', StatusCodes.BAD_REQUEST);

        this.gameDispatcherService.requestJoinGame(gameId, playerId, playerName);

        this.socketService.sio?.to(gameId).emit(JOIN_REQUEST, { opponentName: playerName });
    }

    private async handleAcceptRequest(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException('playerName required', StatusCodes.BAD_REQUEST);

        const game = await this.gameDispatcherService.acceptJoinRequest(gameId, playerId, playerName);

        this.socketService.addToRoom(game.player2.getId(), gameId);
        this.socketService.sio?.to(gameId).emit(START_GAME, { game });
    }

    private handleRejectRequest(gameId: string, playerId: string, playerName: string) {
        if (playerName === undefined) throw new HttpException('playerName required', StatusCodes.BAD_REQUEST);

        const rejectedPlayerId = this.gameDispatcherService.rejectJoinRequest(gameId, playerId, playerName);

        this.socketService.getSocket(rejectedPlayerId).emit(REJECTED);
    }
}
