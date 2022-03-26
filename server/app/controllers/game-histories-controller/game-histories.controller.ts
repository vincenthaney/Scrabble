import { GameHistoriesRequest } from '@app/classes/communication/request';
import { HttpException } from '@app/classes/http-exception/http-exception';
import GameHistoriesService from '@app/services/game-histories-service/game-histories.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameHistoriesController {
    router: Router;

    constructor(private gameHistoriesService: GameHistoriesService, private socketService: SocketService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/gameHistories/:playerId', async (req: GameHistoriesRequest, res: Response) => {
            const { playerId } = req.params;
            try {
                await this.handleGameHistoriesRequest(playerId);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/gameHistories', async (req: GameHistoriesRequest, res: Response) => {
            try {
                await this.handleGameHistoriesReset();
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });
    }

    private async handleGameHistoriesRequest(playerId: string): Promise<void> {
        const gameHistories = await this.gameHistoriesService.getGameHistories();
        this.socketService.emitToSocket(playerId, 'gameHistoriesList', gameHistories);
    }

    private async handleGameHistoriesReset(): Promise<void> {
        await this.gameHistoriesService.resetGameHistories();
    }
}
