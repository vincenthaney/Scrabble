/* eslint-disable no-console */
import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { GameConfigData, StartMultiplayerGameData } from '@app/classes/communication/game-config';
import { LobbyInfo } from '@app/classes/communication/lobby-info';
import { PlayerName } from '@app/classes/communication/player-name';
import { GameService } from '@app/services';
import { SocketService } from '@app/services/socket/socket.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController {
    createGameEvent: EventEmitter<string> = new EventEmitter();
    joinRequestEvent: EventEmitter<string> = new EventEmitter();
    canceledGameEvent: EventEmitter<string> = new EventEmitter();
    leaveLobbyEvent: EventEmitter<string> = new EventEmitter();
    lobbyFullEvent: EventEmitter<string> = new EventEmitter();
    lobbiesUpdateEvent: EventEmitter<LobbyInfo[]> = new EventEmitter();
    joinerLeaveGameEvent: EventEmitter<string> = new EventEmitter();

    constructor(private http: HttpClient, public socketService: SocketService, private gameService: GameService) {
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketService.on('joinRequest', (opponent: PlayerName[]) => {
            this.joinRequestEvent.emit(opponent[0].name);
        });
        this.socketService.on('startGame', (startGameData: StartMultiplayerGameData[]) =>
            this.gameService.initializeMultiplayerGame(this.socketService.getId(), startGameData[0]),
        );
        this.socketService.on('lobbiesUpdate', (lobbies: LobbyInfo[][]) => {
            this.lobbiesUpdateEvent.emit(lobbies[0]);
        });
        this.socketService.on('lobbyFull', (opponent: PlayerName[]) => this.lobbyFullEvent.emit(opponent[0].name));
        this.socketService.on('canceledGame', (opponent: PlayerName[]) => this.canceledGameEvent.emit(opponent[0].name));
        this.socketService.on('joinerLeaveGame', (opponent: PlayerName[]) => {
            console.log('joinerLeaveGameCLIENT');
            console.log(opponent);
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
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${this.socketService.getId()}/accept`;
        this.http.post(endpoint, { opponentName }).subscribe();
    }

    handleRejectionGameCreation(opponentName: string, gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${this.socketService.getId()}/reject`;
        this.http.post(endpoint, { opponentName }).subscribe();
    }

    handleCancelGame(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${this.socketService.getId()}/cancel`;
        this.http.delete(endpoint).subscribe();
    }

    handleLeaveLobby(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${this.socketService.getId()}/leave`;
        // patch?
        this.http.delete(endpoint).subscribe();
    }

    handleLobbiesListRequest(): void {
        const endpoint = `${environment.serverUrl}/games/${this.socketService.getId()}`;
        this.http.get(endpoint).subscribe();
    }

    handleLobbyJoinRequest(gameId: string, playerName: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${this.socketService.getId()}/join`;
        this.http.post(endpoint, { playerName }).subscribe();
    }
}
