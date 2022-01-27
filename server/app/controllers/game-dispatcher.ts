import { GameDispatcherService } from '@app/services/game-dispatcher.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

const OK = 200;
const SERVER_ERROR = 500;

@Service()
export class GameDispatcherController {
    router: Router;

    constructor(private readonly gameDispatcherService: GameDispatcherService) {
        this.configureRouter();
    }

    configureRouter(): void {
        this.router = Router();

        this.router.get('/new', async (req: Request, res: Response) => {
            this.gameDispatcherService
                .createNewGame()
                .then((d) => res.status(OK).send(d))
                .catch((e) => res.status(SERVER_ERROR).send(e));
        });
    }
}
