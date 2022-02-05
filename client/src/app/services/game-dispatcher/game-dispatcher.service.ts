import { EventEmitter, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Player } from '@app/classes/player';
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

    handleCreateGame(playerName: string, gameParameters: FormGroup) {
        const player1: Player = new Player(playerName);
        // eslint-disable-next-line no-console
        console.log('Player ' + player1);
        // eslint-disable-next-line no-console
        console.log('GameType: ' + gameParameters.get('gameType')?.value);
        // eslint-disable-next-line no-console
        console.log('Timer: ' + gameParameters.get('timer')?.value);
        // eslint-disable-next-line no-console
        console.log('Dict: ' + gameParameters.get('dict')?.value);
        // const gameConfig: GameConfig = {
        //     player1,
        //     gameType: gameParameters.get('gameType')?.value as GameType,
        //     maxRoundTime: gameParameters.get('timer')?.value as number,
        //     dictionaryName: gameParameters.get('dict')?.value as string,
        // };
        // this.gameDispatcherController.handleMultiplayerGameCreation(gameConfig);
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
