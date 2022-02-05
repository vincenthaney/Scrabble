import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { GameConfigData } from '@app/classes/communication/game-config';
import { SocketController } from '@app/controllers/socket-controller/socket-client.controller';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController extends SocketController {
    createGameEvent: EventEmitter<string> = new EventEmitter();
    joinRequestEvent: EventEmitter<string> = new EventEmitter();
    constructor(private http: HttpClient) {
        super();
        this.connect();
        this.configureSocket();
    }

    configureSocket(): void {
        this.on('joinRequest', (opponentName: string) => this.joinRequestEvent.emit(opponentName));
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
}
