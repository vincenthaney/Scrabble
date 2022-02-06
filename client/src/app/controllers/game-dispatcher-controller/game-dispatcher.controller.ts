import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { GameConfigData, StartMultiplayerGameData } from '@app/classes/communication/game-config';
import { LobbyInfo } from '@app/classes/communication/lobby-info';
import { SocketController } from '@app/controllers/socket-controller/socket-client.controller';
import { GameService } from '@app/services';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController extends SocketController {
    createGameEvent: EventEmitter<string> = new EventEmitter();
    joinRequestEvent: EventEmitter<string> = new EventEmitter();
    constructor(private http: HttpClient, private gameService: GameService, private gameDispatcherService: GameDispatcherService) {
        super();
        this.connect();
        this.configureSocket();
    }

    configureSocket(): void {
        this.on('joinRequest', (opponentName: string) => this.joinRequestEvent.emit(opponentName));
        this.on('startGame', (startGameData: StartMultiplayerGameData) => this.gameService.initializeMultiplayerGame(this.getId(), startGameData));
        this.on('lobbyUpdate', (lobbies: LobbyInfo[]) => this.gameDispatcherService.handleLobbyUpdate(lobbies));
        this.on('lobbyFull', (opponentName: string) => this.gameDispatcherService.handleLobbyFull(opponentName));
    }

    handleMultiplayerGameCreation(gameConfig: GameConfigData): void {
        const endpoint = `${environment.serverUrl}/games/${this.getId()}`;
        this.http.post<{ gameId: string }>(endpoint, gameConfig).subscribe((response) => {
            this.createGameEvent.emit(response.gameId);
        });
    }

    handleConfirmationGameCreation(opponentName: string, gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${this.getId()}/accept`;
        this.http.post(endpoint, opponentName).subscribe();
    }

    handleRejectionGameCreation(opponentName: string, gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${this.getId()}/reject`;
        this.http.post(endpoint, opponentName).subscribe();
    }

    // Should there be a param for filter or is the filtering done client side?
    handleLobbiesListRequest(): void {
        const endpoint = `${environment.serverUrl}/games/${this.getId()}`;
        this.http.get(endpoint).subscribe();
    }

    handleLobbyJoinRequest(playerName: string, gameId: string): void {
        // games/gameId or lobbies/lobbyId??
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${this.getId()}/join`;
        this.http.post(endpoint, playerName).subscribe();
    }
}
