import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionData } from '@app/classes/actions/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Message, MessageTypes } from '@app/classes/communication/message';
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
        sender: 'System',
        date: new Date(),
        type: MessageTypes.System,
    });

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    configureSocket(): void {
        // this.socketService.on('gameUpdate', (data: GameUpdateData) => this.gameService.handleGameUpdate(data));
        // this.socketService.on('newMessage', (newMessage: Message) => this.gameService.handleNewMessage(newMessage));
        this.socketService.on('gameUpdate', (newData: GameUpdateData) => this.gameUpdateValue.next(newData));
        this.socketService.on('newMessage', (newMessage: Message) => this.newMessageValue.next(newMessage));
    }

    sendAction(gameId: string, playerId: string, action: ActionData) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/${action.type}`;
        this.http.post(endpoint, action.payload).subscribe();
    }

    sendMessage(gameId: string, message: Message) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/message`;
        this.http.post(endpoint, message).subscribe();
    }
}
