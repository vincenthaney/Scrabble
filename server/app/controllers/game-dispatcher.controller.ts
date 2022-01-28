import { GameDispatcherService } from '@app/services/game-dispatcher.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import * as HttpStatus from '@app/constants/http-status';

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
                .then((d) => res.status(HttpStatus.ACCEPTED).send(d))
                .catch((e) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e));
        });
    }
}
