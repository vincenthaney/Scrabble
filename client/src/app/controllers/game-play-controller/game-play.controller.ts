import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionData } from '@app/classes/actions/action-data';
import { GameUpdateData } from '@app/classes/communication/';
import SocketService from '@app/services/socket/socket.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamePlayController {
    gameUpdateData: Observable<GameUpdateData>;
    private gameUpdateSource: BehaviorSubject<GameUpdateData>;
    constructor(private http: HttpClient, public socketService: SocketService) {
        this.gameUpdateSource = new BehaviorSubject<GameUpdateData>({});
        this.gameUpdateData = this.gameUpdateSource.asObservable();
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketService.on('gameUpdate', (data: GameUpdateData) => this.gameUpdateSource.next(data));
    }

    handleAction(gameId: string, playerId: string, action: ActionData) {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${playerId}/action`;
        this.http.post(endpoint, action).subscribe();
    }
}
