import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { LobbyInfo, PlayerName } from '@app/classes/communication/';
import { GameConfig, GameConfigData, InitializeGameData, StartGameData } from '@app/classes/communication/game-config';
import SocketService from '@app/services/socket/socket.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController implements OnDestroy {
    private createGameEvent: Subject<string> = new Subject();
    private joinRequestEvent: Subject<string> = new Subject();
    private canceledGameEvent: Subject<string> = new Subject();
    private lobbyFullEvent: Subject<void> = new Subject();
    private lobbyRequestValidEvent: Subject<void> = new Subject();
    private lobbiesUpdateEvent: Subject<LobbyInfo[]> = new Subject();
    private joinerRejectedEvent: Subject<string> = new Subject();
    private initializeGame$: BehaviorSubject<InitializeGameData | undefined> = new BehaviorSubject<InitializeGameData | undefined>(undefined);

    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    async delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    configureSocket(): void {
        this.socketService.on('joinRequest', (opponent: PlayerName) => {
            this.joinRequestEvent.next(opponent.name);
        });
        this.socketService.on('startGame', async (startGameData: StartGameData) => {
            this.initializeGame$.next({ localPlayerId: this.socketService.getId(), startGameData });
        });
        this.socketService.on('lobbiesUpdate', (lobbies: LobbyInfo[]) => {
            this.lobbiesUpdateEvent.next(lobbies);
        });
        this.socketService.on('rejected', (hostName: PlayerName) => {
            this.joinerRejectedEvent.next(hostName.name);
        });
        this.socketService.on('canceledGame', (opponent: PlayerName) => this.canceledGameEvent.next(opponent.name));
    }

    handleGameCreation(gameConfig: GameConfigData): void {
        const endpoint = `${environment.serverUrl}/games/${this.socketService.getId()}`;
        this.http.post<{ gameId: string }>(endpoint, gameConfig).subscribe((response) => {
            this.createGameEvent.next(response.gameId);
        });
    }

    handleConfirmationGameCreation(opponentName: string, gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/accept`;
        this.http.post(endpoint, { opponentName }).subscribe();
    }

    handleRejectionGameCreation(opponentName: string, gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/reject`;
        this.http.post(endpoint, { opponentName }).subscribe();
    }

    handleCancelGame(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/cancel`;
        this.http.delete(endpoint).subscribe();
    }

    handleLobbiesListRequest(): void {
        const endpoint = `${environment.serverUrl}/games/${this.socketService.getId()}`;
        this.http.get(endpoint).subscribe();
    }

    handleLobbyJoinRequest(gameId: string, playerName: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/join`;
        this.http.post<GameConfig>(endpoint, { playerName }, { observe: 'response' }).subscribe(
            () => {
                this.lobbyRequestValidEvent.next();
            },
            (error) => {
                this.handleJoinError(error);
            },
        );
    }

    // error has any type so we must disable no explicit any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleJoinError(error: any): void {
        if (error.status === HttpStatusCode.Unauthorized) {
            this.lobbyFullEvent.next();
        } else if (error.status === HttpStatusCode.Gone) {
            this.canceledGameEvent.next('Le créateur');
        }
    }

    subscribeToCreateGameEvent(serviceDestroyed$: Subject<boolean>, callback: (gameId: string) => void): void {
        this.createGameEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToJoinRequestEvent(serviceDestroyed$: Subject<boolean>, callback: (opponentName: string) => void): void {
        this.joinRequestEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToCanceledGameEvent(serviceDestroyed$: Subject<boolean>, callback: (hostName: string) => void): void {
        this.canceledGameEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToLobbyFullEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.lobbyFullEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToLobbyRequestValidEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.lobbyRequestValidEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToLobbiesUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (lobbies: LobbyInfo[]) => void): void {
        this.lobbiesUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToJoinerRejectedEvent(serviceDestroyed$: Subject<boolean>, callback: (hostName: string) => void): void {
        this.joinerRejectedEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToInitializeGame(serviceDestroyed$: Subject<boolean>, callback: (value: InitializeGameData | undefined) => void): void {
        this.initializeGame$.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }
}
