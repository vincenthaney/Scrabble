import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionData } from '@app/classes/actions/action-data';
import GameUpdateData from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import { HTTP_ABORT_ERROR } from '@app/constants/controllers-errors';
import SocketService from '@app/services/socket/socket.service';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamePlayController {
    gameUpdateValue = new BehaviorSubject<GameUpdateData>({});
    newMessageValue = new BehaviorSubject<Message>(INITIAL_MESSAGE);

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketService.on('gameUpdate', (newData: GameUpdateData) => {
            this.gameUpdateValue.next(newData);
        });
        this.socketService.on('newMessage', (newMessage: Message) => {
            this.newMessageValue.next(newMessage);
        });
    }

    sendAction(gameId: string, playerId: string, action: ActionData): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${playerId}/action`;
        this.http.post(endpoint, { type: action.type, payload: action.payload, input: action.input }).subscribe();
    }

    sendMessage(gameId: string, playerId: string, message: Message): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${playerId}/message`;
        this.http.post(endpoint, message).subscribe();
    }

    sendError(gameId: string, playerId: string, message: Message): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${playerId}/error`;
        this.http.post(endpoint, message).subscribe();
    }

    handleReconnection(gameId: string, playerId: string, newPlayerId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${playerId}/reconnect`;
        this.http.post(endpoint, { newPlayerId }).subscribe();
    }

    handleDisconnection(gameId: string, playerId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${playerId}/disconnect`;
        // When reloading the page, a the disconnect http request is fired on destruction of the game-page component.
        // In the initialization of the game-page component, a reconnect request is made which does not allow the
        // server to send a response, triggered a Abort 0  error code which is why we catch it if it this this code
        this.http.delete(endpoint, { observe: 'response' }).subscribe(this.handleDisconnectResponse, this.handleDisconnectError);
    }

    private handleDisconnectResponse(): void {
        return;
    }

    private handleDisconnectError(error: { message: string; status: number }): void {
        if (error.status !== HTTP_ABORT_ERROR) throw new Error(error.message);
    }
}
