import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { LobbyInfo, PlayerName } from '@app/classes/communication/';
import { GameConfig, GameConfigData, StartMultiplayerGameData } from '@app/classes/communication/game-config';
import GameService from '@app/services/game/game.service';
import SocketService from '@app/services/socket/socket.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController {
    createGameEvent: EventEmitter<string> = new EventEmitter();
    joinRequestEvent: EventEmitter<string> = new EventEmitter();
    canceledGameEvent: EventEmitter<string> = new EventEmitter();
    leaveLobbyEvent: EventEmitter<string> = new EventEmitter();
    lobbyFullEvent: EventEmitter<void> = new EventEmitter();
    lobbyRequestValidEvent: EventEmitter<void> = new EventEmitter();

    lobbiesUpdateEvent: EventEmitter<LobbyInfo[]> = new EventEmitter();
    joinerLeaveGameEvent: EventEmitter<string> = new EventEmitter();
    joinerRejectedEvent: EventEmitter<string> = new EventEmitter();

    constructor(private http: HttpClient, public socketService: SocketService, private gameService: GameService) {
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketService.on('joinRequest', (opponent: PlayerName[]) => {
            this.joinRequestEvent.emit(opponent[0].name);
        });
        this.socketService.on('startGame', async (startGameData: StartMultiplayerGameData[]) =>
            this.gameService.initializeMultiplayerGame(this.socketService.getId(), startGameData[0]),
        );
        this.socketService.on('lobbiesUpdate', (lobbies: LobbyInfo[][]) => {
            this.lobbiesUpdateEvent.emit(lobbies[0]);
        });
        this.socketService.on('rejected', (hostName: PlayerName[]) => {
            this.joinerRejectedEvent.emit(hostName[0].name);
        });
        this.socketService.on('canceledGame', (opponent: PlayerName[]) => this.canceledGameEvent.emit(opponent[0].name));
        this.socketService.on('joinerLeaveGame', (opponent: PlayerName[]) => {
            this.joinerLeaveGameEvent.emit(opponent[0].name);
        });
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

    handleLeaveLobby(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/leave`;
        this.http.delete(endpoint).subscribe();
    }

    handleLobbiesListRequest(): void {
        const endpoint = `${environment.serverUrl}/games/${this.socketService.getId()}`;
        this.http.get(endpoint).subscribe();
    }

    handleLobbyJoinRequest(gameId: string, playerName: string) {
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
    handleJoinError(error: any) {
        if (error.status === HttpStatusCode.Unauthorized) {
            this.lobbyFullEvent.emit();
        } else if (error.status === HttpStatusCode.Gone) {
            this.canceledGameEvent.emit('Le créateur');
        }
    }
}
