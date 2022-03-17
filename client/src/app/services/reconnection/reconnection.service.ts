import { Injectable } from '@angular/core';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';

@Injectable({
    providedIn: 'root',
})
export class ReconnectionService {
    constructor(private readonly gameDispatcherController: GameDispatcherController) {}

    initializeControllerSockets(): void {
        this.gameDispatcherController.configureSocket();
    }
}
