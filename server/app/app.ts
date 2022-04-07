import { HttpException } from '@app/classes/http-exception/http-exception';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as logger from 'morgan';
import { join } from 'path';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Service } from 'typedi';
import { DictionaryController } from './controllers/dictionary-controller/dictionary.controller';
import { GameDispatcherController } from './controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GameHistoriesController } from './controllers/game-histories-controller/game-histories.controller';
import { GamePlayController } from './controllers/game-play-controller/game-play.controller';
import { HighScoresController } from './controllers/high-scores-controller/high-scores.controller';
import DatabaseService from './services/database-service/database.service';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;
    private readonly swaggerOptions: swaggerJSDoc.Options;

    constructor(
        private readonly gamePlayController: GamePlayController,
        private readonly gameDispatcherController: GameDispatcherController,
        private readonly highScoreController: HighScoresController,
        private readonly dictionaryController: DictionaryController,
        private readonly gameHistoriesController: GameHistoriesController,
        private readonly databaseService: DatabaseService,
    ) {
        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();

        this.setPublicDirectory();

        this.bindRoutes();

        this.connectDatabase();
    }

    bindRoutes(): void {
        this.app.use('/api', this.gamePlayController.router);
        this.app.use('/api', this.gameDispatcherController.router);
        this.app.use('/api', this.highScoreController.router);
        this.app.use('/api', this.dictionaryController.router);
        this.app.use('/api', this.gameHistoriesController.router);
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.app.use('/', (req, res) => {
            res.redirect('/api/docs');
        });
        this.errorHandling();
    }

    private connectDatabase(): void {
        // Connect to the mongoDB database
        this.databaseService.connectToServer();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private setPublicDirectory(): void {
        const path = join(__dirname, '../public');
        this.app.use('/public', express.static(path));
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
