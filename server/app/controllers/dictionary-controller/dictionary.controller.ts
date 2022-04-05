import { DictionaryRequest } from '@app/classes/communication/request';
import { DictionaryData } from '@app/classes/dictionary';
import { BasicDictionaryData, DictionarySummary, DictionaryUpdateInfo } from '@app/classes/communication/dictionary-data';
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

        this.router.post('/dictionaries', async (req: DictionaryRequest, res: Response) => {
            const dictionaryData: DictionaryData = req.body;
            console.log(dictionaryData);
            try {
                await this.dictionaryService.addNewDictionary(dictionaryData);
                res.status(StatusCodes.CREATED).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.patch('/dictionaries', async (req: DictionaryRequest, res: Response) => {
            const dictionaryUpdateInfo: DictionaryUpdateInfo = req.body;

            try {
                await this.dictionaryService.updateDictionary(dictionaryUpdateInfo);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/dictionaries', async (req: DictionaryRequest, res: Response) => {
            const dictionaryId: string = req.query.dictionaryId as string;
            try {
                await this.dictionaryService.deleteDictionary(dictionaryId);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.get('/dictionaries/summary', async (req: DictionaryRequest, res: Response) => {
            try {
                const dictionarySummaries: DictionarySummary[] = await this.dictionaryService.getAllDictionarySummaries();
                res.status(StatusCodes.OK).send(dictionarySummaries);
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.get('/dictionaries/:dictionaryId', async (req: DictionaryRequest, res: Response) => {
            const { dictionaryId } = req.params;

            try {
                const dictionaryData: DictionaryData = await this.dictionaryService.getDbDictionary(dictionaryId);
                const dictionaryToSend: BasicDictionaryData = {
                    title: dictionaryData.title,
                    description: dictionaryData.description,
                    words: dictionaryData.words,
                };

                res.status(StatusCodes.OK).send(dictionaryToSend);
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.delete('/dictionaries/reset', async (req: DictionaryRequest, res: Response) => {
            try {
                await this.dictionaryService.resetDbDictionaries();
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });
    }
}
