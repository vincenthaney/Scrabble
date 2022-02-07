import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionType } from '@app/classes/actions';
import { ActionPlacePayload } from '@app/classes/actions/action-place';
import { GameUpdateData } from '@app/classes/game-update-data';
import { SocketController } from '@app/controllers/socket-controller/socket-client.controller';
import { GameService } from '@app/services';
import { Observable } from 'rxjs';
import * as io from 'socket.io';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamePlayController extends SocketController {
    private gameId: string;

    constructor(private http: HttpClient, private gameService: GameService, socket: io.Socket) {
        super(socket);
    }

    configureSocket(): void {
        // this.on('play-action', this.handlePlayAction);
    }

    handlePlaceAction(playerId: string, payload: ActionPlacePayload): Observable<GameUpdateData> {
        const endpoint = `${environment.serverUrl}/games/${this.getGameId()}/player/${playerId}/${ActionType.PLACE}`;
        return this.http.post<GameUpdateData>(endpoint, payload);
    }

    getGameId(): string {
        return this.gameId;
    }
}
