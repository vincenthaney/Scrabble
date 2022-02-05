import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionData } from '@app/classes/actions/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { SocketController } from '@app/controllers/socket-controller/socket-client.controller';
import { GameService } from '@app/services';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamePlayController extends SocketController {
    constructor(private http: HttpClient, private gameService: GameService) {
        super();
        this.connect();
    }

    configureSocket(): void {
        this.on('gameUpdate', (data: GameUpdateData) => this.gameService.handleGameUpdate(data));
    }

    handleAction(playerId: string, action: ActionData) {
        const endpoint = `${environment.serverUrl}/games/${this.getGameId()}/player/${playerId}/${action.type}`;
        this.http.post(endpoint, action.payload).subscribe();
    }

    getGameId(): string {
        return this.gameService.getGameId();
    }
}
