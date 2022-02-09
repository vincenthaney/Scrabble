import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GameConfigData } from '@app/classes/communication/game-config';
import { LobbyInfo } from '@app/classes/communication/lobby-info';
import { GameType } from '@app/classes/game-type';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherService implements OnDestroy {
    serviceDestroyed$: Subject<boolean> = new Subject();
    gameId: string | undefined;
    joinRequestEvent: EventEmitter<string> = new EventEmitter();
    lobbiesUpdateEvent: EventEmitter<LobbyInfo[]> = new EventEmitter();
    lobbyFullEvent: EventEmitter<string> = new EventEmitter();
    canceledGameEvent: EventEmitter<string> = new EventEmitter();
    joinerLeaveGameEvent: EventEmitter<string> = new EventEmitter();
    joinerRejectedEvent: EventEmitter<string> = new EventEmitter();

    createGameSubscription: Subscription;
    joinRequestSubscription: Subscription;
    lobbiesUpdateSubscription: Subscription;
    lobbyFullSubscription: Subscription;
    canceledGameSubscription: Subscription;
    joinerLeaveGameSubscription: Subscription;
    joinerRejectedSubscription: Subscription;

    constructor(private gameDispatcherController: GameDispatcherController) {
        this.createGameSubscription = this.gameDispatcherController.createGameEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((gameId: string) => {
                this.gameId = gameId;
            });
        this.joinRequestSubscription = this.gameDispatcherController.joinRequestEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((opponentName: string) => this.handleJoinRequest(opponentName));
        this.lobbyFullSubscription = this.gameDispatcherController.lobbyFullEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((opponentName: string) => this.handleLobbyFull(opponentName));
        this.canceledGameSubscription = this.gameDispatcherController.canceledGameEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((hostName: string) => this.handleCanceledGame(hostName));
        this.joinerLeaveGameSubscription = this.gameDispatcherController.joinerLeaveGameEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((leaverName: string) => this.handleJoinerLeaveGame(leaverName));
        this.joinerRejectedSubscription = this.gameDispatcherController.joinerRejectedEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((hostName: string) => this.handleJoinerRejected(hostName));
        this.lobbiesUpdateSubscription = this.gameDispatcherController.lobbiesUpdateEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((lobbies: LobbyInfo[]) => this.handleLobbiesUpdate(lobbies));
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }
    handleJoinLobby(gameId: string, playerName: string) {
        this.gameId = gameId;
        this.gameDispatcherController.handleLobbyJoinRequest(gameId, playerName);
    }

    handleLobbyListRequest() {
        this.gameDispatcherController.handleLobbiesListRequest();
    }

    handleLeaveLobby() {
        if (this.gameId) this.gameDispatcherController.handleLeaveLobby(this.gameId);
        this.gameId = undefined;
    }
    handleCreateGame(playerName: string, gameParameters: FormGroup) {
        const gameConfig: GameConfigData = {
            playerName,
            playerId: this.gameDispatcherController.socketService.getId(),
            gameType: gameParameters.get('gameType')?.value as GameType,
            maxRoundTime: gameParameters.get('timer')?.value as number,
            dictionary: gameParameters.get('dictionary')?.value as string,
        };
        this.gameDispatcherController.handleMultiplayerGameCreation(gameConfig);
    }

    handleCancelGame() {
        if (this.gameId) this.gameDispatcherController.handleCancelGame(this.gameId);
        this.gameId = undefined;
    }

    handleConfirmation(opponentName: string) {
        if (this.gameId) this.gameDispatcherController.handleConfirmationGameCreation(opponentName, this.gameId);
    }

    handleRejection(opponentName: string) {
        if (this.gameId) this.gameDispatcherController.handleRejectionGameCreation(opponentName, this.gameId);
    }

    handleJoinRequest(opponentName: string) {
        this.joinRequestEvent.emit(opponentName);
    }

    handleJoinerRejected(hostName: string) {
        this.joinerRejectedEvent.emit(hostName);
        this.gameId = undefined;
    }

    handleLobbiesUpdate(lobbies: LobbyInfo[]) {
        this.lobbiesUpdateEvent.emit(lobbies);
    }

    handleLobbyFull(opponentName: string) {
        this.lobbyFullEvent.emit(opponentName);
        this.gameId = undefined;
    }

    handleCanceledGame(hostName: string) {
        this.canceledGameEvent.emit(hostName);
        this.gameId = undefined;
    }

    handleJoinerLeaveGame(leaverName: string) {
        this.joinerLeaveGameEvent.emit(leaverName);
    }
}
