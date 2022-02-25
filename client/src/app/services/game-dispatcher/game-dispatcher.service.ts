import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LobbyInfo } from '@app/classes/communication/';
import { GameConfigData } from '@app/classes/communication/game-config';
import { GameType } from '@app/classes/game-type';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export default class GameDispatcherService implements OnDestroy {
    gameId: string;
    currentLobby: LobbyInfo | undefined;
    currentName: string;

    private joinRequestEvent: Subject<string> = new Subject();
    private canceledGameEvent: Subject<string> = new Subject();
    private lobbyFullEvent: Subject<void> = new Subject();
    private lobbiesUpdateEvent: Subject<LobbyInfo[]> = new Subject();
    private joinerRejectedEvent: Subject<string> = new Subject();

    private componentDestroyed$: Subject<boolean> = new Subject();

    constructor(private gameDispatcherController: GameDispatcherController, public router: Router) {
        this.gameDispatcherController.subscribeToCreateGameEvent(this.componentDestroyed$, (gameId: string) => {
            this.gameId = gameId;
        });
        this.gameDispatcherController.subscribeToJoinRequestEvent(this.componentDestroyed$, (opponentName: string) =>
            this.handleJoinRequest(opponentName),
        );
        this.gameDispatcherController.subscribeToLobbyFullEvent(this.componentDestroyed$, () => this.handleLobbyFull());
        this.gameDispatcherController.subscribeToLobbyRequestValidEvent(this.componentDestroyed$, async () =>
            this.router.navigateByUrl('join-waiting-room'),
        );
        this.gameDispatcherController.subscribeToCanceledGameEvent(this.componentDestroyed$, (hostName: string) => this.handleCanceledGame(hostName));
        this.gameDispatcherController.subscribeToJoinerRejectedEvent(this.componentDestroyed$, (hostName: string) =>
            this.handleJoinerRejected(hostName),
        );
        this.gameDispatcherController.subscribeToLobbiesUpdateEvent(this.componentDestroyed$, (lobbies: LobbyInfo[]) =>
            this.handleLobbiesUpdate(lobbies),
        );
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    resetServiceData(): void {
        this.currentLobby = undefined;
        this.currentName = '';
        this.gameId = '';
    }

    handleJoinLobby(lobby: LobbyInfo, playerName: string): void {
        this.currentLobby = lobby;
        this.currentName = playerName;
        this.gameId = lobby.lobbyId;
        this.gameDispatcherController.handleLobbyJoinRequest(this.gameId, playerName);
    }

    handleLobbyListRequest(): void {
        this.gameDispatcherController.handleLobbiesListRequest();
    }

    handleCreateGame(playerName: string, gameParameters: FormGroup): void {
        const gameConfig: GameConfigData = {
            playerName,
            playerId: this.gameDispatcherController.socketService.getId(),
            gameType: gameParameters.get('gameType')?.value as GameType,
            maxRoundTime: gameParameters.get('timer')?.value as number,
            dictionary: gameParameters.get('dictionary')?.value as string,
        };
        this.gameDispatcherController.handleMultiplayerGameCreation(gameConfig);
    }

    handleCancelGame(): void {
        if (this.gameId) this.gameDispatcherController.handleCancelGame(this.gameId);
        this.resetServiceData();
    }

    handleConfirmation(opponentName: string): void {
        if (this.gameId) this.gameDispatcherController.handleConfirmationGameCreation(opponentName, this.gameId);
    }

    handleRejection(opponentName: string): void {
        if (this.gameId) this.gameDispatcherController.handleRejectionGameCreation(opponentName, this.gameId);
    }

    handleJoinRequest(opponentName: string): void {
        this.joinRequestEvent.next(opponentName);
    }

    handleJoinerRejected(hostName: string): void {
        this.joinerRejectedEvent.next(hostName);
        this.resetServiceData();
    }

    handleLobbiesUpdate(lobbies: LobbyInfo[]): void {
        this.lobbiesUpdateEvent.next(lobbies);
    }

    handleLobbyFull(): void {
        this.lobbyFullEvent.next();
        this.resetServiceData();
    }

    handleCanceledGame(hostName: string): void {
        this.canceledGameEvent.next(hostName);
        this.resetServiceData();
    }

    subscribeToJoinRequestEvent(componentDestroyed$: Subject<boolean>, callback: (opponentName: string) => void): void {
        this.joinRequestEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToCanceledGameEvent(componentDestroyed$: Subject<boolean>, callback: (hostName: string) => void): void {
        this.canceledGameEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToLobbyFullEvent(componentDestroyed$: Subject<boolean>, callback: () => void): void {
        this.lobbyFullEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToLobbiesUpdateEvent(componentDestroyed$: Subject<boolean>, callback: (lobbies: LobbyInfo[]) => void): void {
        this.lobbiesUpdateEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }

    subscribeToJoinerRejectedEvent(componentDestroyed$: Subject<boolean>, callback: (hostName: string) => void): void {
        this.joinerRejectedEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }
}
