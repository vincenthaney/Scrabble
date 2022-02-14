import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionData } from '@app/classes/actions/action-data';
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
    newMessageValue = new BehaviorSubject<Message>({
        content: 'Début de la partie',
        senderId: SYSTEM_ID,
    });

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketService.on('gameUpdate', (newData: GameUpdateData[]) => {
            // eslint-disable-next-line no-console
            console.log('game update player1: ' + newData[0].player1?.score);
            // eslint-disable-next-line no-console
            console.log('game update player2: ' + newData[0].player2?.score);
            this.gameUpdateValue.next(newData[0]);
        });
        this.socketService.on('newMessage', (newMessage: Message[]) => {
            // eslint-disable-next-line no-console
            console.log('game update message: ' + newMessage[0].content);
            this.newMessageValue.next(newMessage[0]);
        });
    }

    sendAction(gameId: string, playerId: string, action: ActionData, typedInput: string) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/action`;
        this.http.post(endpoint, { type: action.type, payload: action.payload, input: typedInput }).subscribe();
    }

    sendMessage(gameId: string, playerId: string, message: Message) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/message`;
        this.http.post(endpoint, message).subscribe();
    }

    sendError(gameId: string, playerId: string, message: Message) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/error`;
        this.http.post(endpoint, message).subscribe();
    }
}
