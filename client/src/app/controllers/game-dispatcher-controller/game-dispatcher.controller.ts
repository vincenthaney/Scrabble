import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { LobbyInfo, PlayerName } from '@app/classes/communication/';
import { GameConfig, GameConfigData, StartGameData } from '@app/classes/communication/game-config';
import GameService from '@app/services/game/game.service';
import SocketService from '@app/services/socket/socket.service';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController implements OnDestroy {
    createGameEvent: EventEmitter<string> = new EventEmitter();
    joinRequestEvent: EventEmitter<string> = new EventEmitter();
    canceledGameEvent: EventEmitter<string> = new EventEmitter();
    leaveLobbyEvent: EventEmitter<string> = new EventEmitter();
    lobbyFullEvent: EventEmitter<void> = new EventEmitter();
    lobbyRequestValidEvent: EventEmitter<void> = new EventEmitter();
    lobbiesUpdateEvent: EventEmitter<LobbyInfo[]> = new EventEmitter();
    joinerRejectedEvent: EventEmitter<string> = new EventEmitter();

    serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService, private readonly gameService: GameService) {
        this.configureSocket();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    configureSocket(): void {
        this.socketService.on('joinRequest', (opponent: PlayerName) => {
            this.joinRequestEvent.emit(opponent.name);
        });
        this.socketService.on('startGame', (startGameData: StartGameData) => {
            this.gameService.initializeGame(this.socketService.getId(), startGameData);
        });
        this.socketService.on('lobbiesUpdate', (lobbies: LobbyInfo[]) => {
            this.lobbiesUpdateEvent.emit(lobbies);
        });
        this.socketService.on('rejected', (hostName: PlayerName) => {
            this.joinerRejectedEvent.emit(hostName.name);
        });
        this.socketService.on('canceledGame', (opponent: PlayerName) => this.canceledGameEvent.emit(opponent.name));
    }

    handleMultiplayerGameCreation(gameConfig: GameConfigData): void {
        const endpoint = `${environment.serverUrl}/games/${this.socketService.getId()}`;
        this.http.post<{ gameId: string }>(endpoint, gameConfig).subscribe((response) => {
            this.createGameEvent.emit(response.gameId);
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
                this.lobbyRequestValidEvent.emit();
            },
            (error) => {
                this.handleJoinError(error);
            },
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleJoinError(error: any): void {
        if (error.status === HttpStatusCode.Unauthorized) {
            this.lobbyFullEvent.emit();
        } else if (error.status === HttpStatusCode.Gone) {
            this.canceledGameEvent.emit('Le créateur');
        }
    }
}
