import { EventEmitter, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GameConfigData } from '@app/classes/communication/game-config';
import { GameType } from '@app/classes/game-type';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { Subscription } from 'rxjs';
// import 'mock-fs';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherService {
    gameId: string;
    joinRequestEvent: EventEmitter<string> = new EventEmitter();
    createGameSubscription: Subscription;
    joinRequestSubscription: Subscription;
    constructor(private gameDispatcherController: GameDispatcherController) {
        this.createGameSubscription = this.gameDispatcherController.createGameEvent.subscribe((gameId: string) => {
            this.gameId = gameId;
        });
        this.joinRequestSubscription = this.gameDispatcherController.joinRequestEvent.subscribe((opponentName: string) =>
            this.handleJoinRequest(opponentName),
        );
    }

    handleCreateGame(playerName: string, gameParameters: FormGroup) {
        const gameConfig: GameConfigData = {
            playerName,
            playerId: this.gameDispatcherController.getId(),
            gameType: gameParameters.get('gameType')?.value as GameType,
            maxRoundTime: gameParameters.get('timer')?.value as number,
            dictionary: gameParameters.get('dict')?.value as string,
        };
        this.gameDispatcherController.handleMultiplayerGameCreation(gameConfig);
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
