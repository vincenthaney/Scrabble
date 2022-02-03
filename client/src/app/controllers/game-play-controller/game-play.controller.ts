import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionData } from '@app/classes/actions/action-data';
import { GameUpdateData } from '@app/classes/game-update-data';
import { SocketController } from '@app/controllers/socket-controller/socket-client.controller';
import { GameService } from '@app/services';
import { Observable } from 'rxjs';
import * as io from 'socket.io';
import { environment } from 'src/environments/environment';
import { INVALID_ACTION_CALL } from './game-play.controller.errors';

@Injectable({
    providedIn: 'root',
})
export class GamePlayController extends SocketController {
    private gameId: string;

    constructor(private http: HttpClient, private gameService: GameService, socket: io.Socket) {
        super(socket);
    }

    configureSocket(): void {
        this.on('gameUpdate', (data: GameUpdateData) => this.gameService.handleGameUpdate(data));
    }

    handleAction(playerId: string, action: ActionData): Observable<GameUpdateData> {
        if (!action || !playerId) {
            throw new Error(INVALID_ACTION_CALL);
        }
        const endpoint = `${environment.serverUrl}/games/${this.getGameId()}/player/${playerId}/${action.type}`;
        return this.http.post<GameUpdateData>(endpoint, action.payload);
    }

    getGameId(): string {
        return this.gameId;
    }
}
