import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionData } from '@app/classes/actions/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { GameService } from '@app/services';
import { SocketService } from '@app/services/socket/socket.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamePlayController {
    constructor(private http: HttpClient, public socketService: SocketService, private gameService: GameService) {
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketService.on('gameUpdate', (data: GameUpdateData) => this.gameService.handleGameUpdate(data));
    }

    handleAction(playerId: string, action: ActionData) {
        const endpoint = `${environment.serverUrl}/games/${this.getGameId()}/player/${playerId}/${action.type}`;
        this.http.post(endpoint, action.payload).subscribe();
    }

    getGameId(): string {
        return this.gameService.getGameId();
    }

    sendMessage(message: string) {}
}
