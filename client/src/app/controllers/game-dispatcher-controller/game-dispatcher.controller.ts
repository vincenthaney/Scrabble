import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/communication/game-config';
import { SocketController } from '@app/controllers/socket-controller/socket-client.controller';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController extends SocketController {
    joinRequestEvent: EventEmitter<string> = new EventEmitter();
    constructor(private http: HttpClient) {
        super();
    }

    configureSocket(): void {
        this.on('joinRequest', (opponentName: string) => this.joinRequestEvent.emit(opponentName));
    }

    handleMultiplayerGameCreation(gameConfig: GameConfig): void {
        const endpoint = `${environment.serverUrl}/games/`;
        this.http.post<{ id: string }>(endpoint, gameConfig).subscribe(); // Add handling of the lobby creation
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
