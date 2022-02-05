import { EventEmitter, Injectable } from '@angular/core';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { Subscription } from 'rxjs';
// import 'mock-fs';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherService {
    gameId: string;
    playerId: string;
    joinRequestEvent: EventEmitter<string> = new EventEmitter();
    joinRequestSubscription: Subscription;
    constructor(private gameDispatcherController: GameDispatcherController) {
        this.joinRequestSubscription = this.gameDispatcherController.joinRequestEvent.subscribe((opponentName: string) =>
            this.handleJoinRequest(opponentName),
        );
    }

    handleJoinRequest(opponentName: string) {
        this.joinRequestEvent.emit(opponentName);
    }

    handleConfirmation(opponentName: string) {
        this.gameDispatcherController.handleConfirmationGameCreation(opponentName, this.gameId);
    }

    handleRejection(opponentName: string) {
        this.gameDispatcherController.handleRejectionGameCreation(opponentName, this.gameId);
    }
}
