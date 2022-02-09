import { ActionData } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { GameRequest } from '@app/classes/communication/request';
import { HttpException } from '@app/classes/http.exception';
import { GamePlayService } from '@app/services/game-play-service/game-play.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GamePlayController {
    router: Router;

    constructor(private readonly gamePlayService: GamePlayService, private readonly socketService: SocketService) {
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

            // eslint-disable-next-line no-console
            console.log(data);
            try {
                this.handlePlayAction(gameId, playerId, data);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (e) {
                HttpException.sendError(e, res);
            }
        });
    }

    private handlePlayAction(gameId: string, playerId: string, data: ActionData) {
        if (data.type === undefined) throw new HttpException('type is required', StatusCodes.BAD_REQUEST);
        if (data.payload === undefined) throw new HttpException('payload is required', StatusCodes.BAD_REQUEST);

        const updateData = this.gamePlayService.playAction(gameId, playerId, data);
        if (updateData) {
            this.gameUpdate(gameId, updateData);
        }
    }
}
