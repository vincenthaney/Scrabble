import { DictionaryRequest } from '@app/classes/communication/request';
import { DictionaryData } from '@app/classes/dictionary';
import { HttpException } from '@app/classes/http-exception/http-exception';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class DictionaryController {
    router: Router;

    constructor(private dictionaryService: DictionaryService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/dictionary', async (req: DictionaryRequest, res: Response) => {
            const body: DictionaryData = req.body;

            try {
                await this.handleAddDictionary(body);
                res.status(StatusCodes.CREATED).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.patch('/dictionary', async (req: DictionaryRequest, res: Response) => {
            const body: DictionaryData = req.body;

            try {
                await this.handleAddDictionary(body);
                res.status(StatusCodes.CREATED).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/dictionary', async (req: DictionaryRequest, res: Response) => {
            const body: DictionaryData = req.body;

            try {
                await this.handleAddDictionary(body);
                res.status(StatusCodes.CREATED).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.get('/dictionary', async (req: DictionaryRequest, res: Response) => {
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

    private async handleAddDictionary(dictionaryData: DictionaryData): Promise<void> {
        await this.dictionaryService.addNewDictionary(dictionaryData);
    }

    // private async handleHighScoresRequest(playerId: string): Promise<void> {
    //     const highScores = await this.highScoresService.getAllHighScores();
    //     this.socketService.emitToSocket(playerId, 'highScoresList', highScores);
    // }
}
