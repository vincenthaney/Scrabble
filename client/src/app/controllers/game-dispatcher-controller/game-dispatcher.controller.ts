import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/communication/game-config';
import { SocketController } from '@app/controllers/socket-controller/socket-client.controller';
import { GameService } from '@app/services';
import * as io from 'socket.io';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameDispatcherController extends SocketController {
    constructor(private http: HttpClient, socket: io.Socket, private gameService: GameService) {
        super(socket);
    }

    configureSocket(): void {
        // this.on('gameUpdate', (data: GameUpdateData) => this.gameService.handleGameUpdate(data));
    }

    handleMultiplayerGameCreation(gameConfig: GameConfig): void {
        const endpoint = `${environment.serverUrl}/games/`;
        this.http.post<{ id: string }>(endpoint, gameConfig).subscribe(); // Add handling of the lobby creation
    }
}
