import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { PlayerName } from '@app/classes/communication/';
import SocketService from '@app/services/socket/socket.service';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PlayerLeavesController implements OnDestroy {
    joinerLeaveGameEvent: EventEmitter<string> = new EventEmitter();
    playerLeftGameSubject: Subject<string> = new Subject();
    serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    configureSocket(): void {
        this.socketService.on('joinerLeaveGame', (opponent: PlayerName[]) => {
            this.joinerLeaveGameEvent.emit(opponent[0].name);
        });

        this.socketService.on('playerLeft', (playerName: PlayerName[]) => {
            this.playerLeftGameSubject.next(playerName[0].name);
        });
    }

    handleLeaveGame(gameId: string | undefined): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/player/${this.socketService.getId()}/leave`;
        this.http.delete(endpoint).subscribe();
    }
}
