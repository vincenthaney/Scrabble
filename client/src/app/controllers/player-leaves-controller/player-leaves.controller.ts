import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { PlayerName } from '@app/classes/communication/';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import SocketService from '@app/services/socket/socket.service';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PlayerLeavesController implements OnDestroy {
    joinerLeaveGameEvent: EventEmitter<string> = new EventEmitter();
    resetGameEvent: EventEmitter<string> = new EventEmitter();
    serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService, private readonly gamePlayController: GamePlayController) {
        this.configureSocket();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    configureSocket(): void {
        this.socketService.on('joinerLeaveGame', (opponent: PlayerName) => {
            this.joinerLeaveGameEvent.emit(opponent.name);
        });

        this.socketService.on('cleanup', () => {
            this.gamePlayController.newMessageValue.next(INITIAL_MESSAGE);
            this.resetGameEvent.emit();
        });
    }

    handleLeaveGame(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/leave`;
        this.http.delete(endpoint).subscribe();
    }
}
