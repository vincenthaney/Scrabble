import { ActionData } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import { GameRequest } from '@app/classes/communication/request';
import { HttpException } from '@app/classes/http.exception';
import { SYSTEM_ID } from '@app/constants/game';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { GamePlayService } from '@app/services/game-play-service/game-play.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GamePlayController {
    router: Router;

    constructor(
        private readonly gamePlayService: GamePlayService,
        private readonly socketService: SocketService,
        private readonly activeGameService: ActiveGameService,
    ) {
        this.configureRouter();
    }

    gameUpdate(gameId: string, data: GameUpdateData): void {
        this.socketService.emitToRoom(gameId, 'gameUpdate', data);
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/games/:gameId/player/:playerId/action', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const data: ActionData = req.body;
            console.log(req.body);
            console.log(req.params);

            try {
                this.handlePlayAction(gameId, playerId, data);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });

        this.router.post('/games/:gameId/player/:playerId/message', (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const message: Message = req.body;

            try {
                this.handleNewMessage(gameId, playerId, message);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });
    }

    private handlePlayAction(gameId: string, playerId: string, data: ActionData): void {
        if (data.type === undefined) throw new HttpException('type is required', StatusCodes.BAD_REQUEST);
        if (data.payload === undefined) throw new HttpException('payload is required', StatusCodes.BAD_REQUEST);

        const [updateData, localPlayerFeedback, opponentFeedback] = this.gamePlayService.playAction(gameId, playerId, data);
        if (updateData) {
            this.gameUpdate(gameId, updateData);
        }
        if (localPlayerFeedback) {
            this.socketService.emitToSocket(playerId, 'newMessage', {
                content: localPlayerFeedback,
                senderId: SYSTEM_ID,
            });
        }
        if (opponentFeedback) {
            const opponentId = this.activeGameService.getGame(gameId, playerId).getOpponentPlayer(playerId).getId();
            this.socketService.emitToSocket(opponentId, 'newMessage', {
                content: opponentId,
                senderId: SYSTEM_ID,
            });
        }
    }

    private handleNewMessage(gameId: string, playerId: string, message: Message): void {
        if (message.senderId === undefined) throw new HttpException('messager sender is required', StatusCodes.BAD_REQUEST);
        if (message.content === undefined) throw new HttpException('message content is required', StatusCodes.BAD_REQUEST);

        this.socketService.emitToRoom(gameId, 'newMessage', message);
    }
}
