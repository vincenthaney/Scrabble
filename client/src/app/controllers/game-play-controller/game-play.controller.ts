import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionData } from '@app/classes/actions/action-data';
import { GameInfoData } from '@app/classes/communication/game-info';
import GameUpdateData from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import { SYSTEM_ID } from '@app/constants/game';
import SocketService from '@app/services/socket/socket.service';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamePlayController {
    gameUpdateValue = new BehaviorSubject<GameUpdateData>({});
    // TODO: Fix
    gameInfoData = new BehaviorSubject<GameInfoData>({} as unknown as GameInfoData);
    newMessageValue = new BehaviorSubject<Message>({
        content: 'Début de la partie',
        senderId: SYSTEM_ID,
    });

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketService.on('gameUpdate', (newData: GameUpdateData) => this.gameUpdateValue.next(newData));
        this.socketService.on('gameInfo', (newData: GameInfoData) => this.gameInfoData.next(newData));
        this.socketService.on('newMessage', (newMessage: Message[]) => {
            this.newMessageValue.next(newMessage[0]);
        });
    }

    sendAction(gameId: string, playerId: string, action: ActionData) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/action`;
        this.http.post(endpoint, { type: action.type, payload: action.payload }).subscribe();
    }

    sendMessage(gameId: string, playerId: string, message: Message) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/message`;
        this.http.post(endpoint, message).subscribe();
    }

    sendError(gameId: string, playerId: string, message: Message) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/error`;
        this.http.post(endpoint, message).subscribe();
    }

    handleReconnection(gameId: string, playerId: string, newPlayerId: string) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/reconnect`;
        this.http.post(endpoint, { newPlayerId }).subscribe();
    }

    handleDisconnection(gameId: string, playerId: string) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/disconnect`;
        this.http.delete(endpoint).subscribe();
    }
}
