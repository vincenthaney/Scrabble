import { DictionaryRequest, HighScoresRequest } from '@app/classes/communication/request';
import { DictionaryData } from '@app/classes/dictionary';
import { HttpException } from '@app/classes/http-exception/http-exception';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import HighScoresService from '@app/services/high-scores-service/high-scores.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class HighScoresController {
    router: Router;

    constructor(private highScoresService: HighScoresService, private dictionaryService: DictionaryService, private socketService: SocketService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/highScores/:playerId', async (req: HighScoresRequest, res: Response) => {
            const { playerId } = req.params;
            try {
                await this.handleHighScoresRequest(playerId);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.post('/dictionary', async (req: DictionaryRequest, res: Response) => {
            const body: DictionaryData = req.body;

            try {
                await this.handleAddDictionary(body);
                res.status(StatusCodes.CREATED).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        // this.router.patch('/dictionary', async (req: DictionaryRequest, res: Response) => {
        //     try {
        //         await this.handleAddDictionary();
        //         res.status(StatusCodes.CREATED).send();
        //     } catch (exception) {
        //         HttpException.sendError(exception, res);
        //     }
        // });
    }

    private async handleHighScoresRequest(playerId: string): Promise<void> {
        await this.dictionaryService['resetDbDictionaries']();
        const highScores = await this.highScoresService.getAllHighScores();
        this.socketService.emitToSocket(playerId, 'highScoresList', highScores);
    }

    private async handleAddDictionary(dictionaryData: DictionaryData): Promise<void> {
        await this.dictionaryService.addNewDictionary(dictionaryData);
    }

    // private async handleHighScoresRequest(playerId: string): Promise<void> {
    //     const highScores = await this.highScoresService.getAllHighScores();
    //     this.socketService.emitToSocket(playerId, 'highScoresList', highScores);
    // }
}
