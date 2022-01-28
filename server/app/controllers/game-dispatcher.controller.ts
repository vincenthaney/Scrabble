// import { GameDispatcherService } from '@app/services/game-dispatcher.service';
import { /* Request, Response,*/ Router } from 'express';
import { Service } from 'typedi';
// import * as HttpStatus from '@app/constants/http-status';

@Service()
export class GameDispatcherController {
    router: Router;

    constructor(/* private readonly gameDispatcherService: GameDispatcherService*/) {
        this.configureRouter();
    }

    configureRouter(): void {
        this.router = Router();
    }
}
