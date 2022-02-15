import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LobbyInfo } from '@app/classes/communication/';
import { GameConfigData } from '@app/classes/communication/game-config';
import { GameType } from '@app/classes/game-type';
import { IResetServiceData } from '@app/classes/i-reset-service-data';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export default class GameDispatcherService implements OnDestroy, IResetServiceData {
    gameId: string;
    currentLobby: LobbyInfo | undefined;
    currentName: string;
    joinRequestEvent: EventEmitter<string> = new EventEmitter();
    lobbiesUpdateEvent: EventEmitter<LobbyInfo[]> = new EventEmitter();
    lobbyFullEvent: EventEmitter<void> = new EventEmitter();
    canceledGameEvent: EventEmitter<string> = new EventEmitter();
    joinerRejectedEvent: EventEmitter<string> = new EventEmitter();

    createGameSubscription: Subscription;
    joinRequestSubscription: Subscription;
    lobbiesUpdateSubscription: Subscription;
    lobbyFullSubscription: Subscription;
    canceledGameSubscription: Subscription;
    joinRequestValidSubscription: Subscription;
    joinerRejectedSubscription: Subscription;

    serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private gameDispatcherController: GameDispatcherController, public router: Router) {
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
            .subscribe(() => this.handleLobbyFull());
        this.joinRequestValidSubscription = this.gameDispatcherController.lobbyRequestValidEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe(async () => this.router.navigateByUrl('join-waiting-room'));
        this.canceledGameSubscription = this.gameDispatcherController.canceledGameEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((hostName: string) => this.handleCanceledGame(hostName));
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

    resetServiceData() {
        this.currentLobby = undefined;
        this.currentName = '';
        this.gameId = '';
    }

    handleJoinLobby(lobby: LobbyInfo, playerName: string) {
        this.currentLobby = lobby;
        this.currentName = playerName;
        this.gameId = lobby.lobbyId;
        this.gameDispatcherController.handleLobbyJoinRequest(this.gameId, playerName);
    }

    handleLobbyListRequest() {
        this.gameDispatcherController.handleLobbiesListRequest();
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
        this.resetServiceData();
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
        this.resetServiceData();
    }

    handleLobbiesUpdate(lobbies: LobbyInfo[]) {
        this.lobbiesUpdateEvent.emit(lobbies);
    }

    handleLobbyFull() {
        this.lobbyFullEvent.emit();
        this.resetServiceData();
    }

    handleCanceledGame(hostName: string) {
        this.canceledGameEvent.emit(hostName);
        this.resetServiceData();
    }
}
