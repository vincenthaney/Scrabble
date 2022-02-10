import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionData } from '@app/classes/actions/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import { SocketService } from '@app/services/socket/socket.service';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamePlayController {
    gameUpdateValue = new BehaviorSubject<GameUpdateData>({});
    newMessageValue = new BehaviorSubject<Message>({
        content: 'Début de la partie',
        senderId: 'System',
        date: new Date(),
    });

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketService.on('gameUpdate', (newData: GameUpdateData) => this.gameUpdateValue.next(newData));
        this.socketService.on('newMessage', (newMessage: Message[]) => {
            this.newMessageValue.next(newMessage[0]);
        });
    }

    sendAction(gameId: string, playerId: string, action: ActionData) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/action`;
        this.http.post(endpoint, action.payload).subscribe();
    }

    sendMessage(gameId: string, playerId: string, message: Message) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/message`;
        this.http.post(endpoint, message).subscribe();
    }
}
