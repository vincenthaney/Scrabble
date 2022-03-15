import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { PlayerName } from '@app/classes/communication/';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import SocketService from '@app/services/socket/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PlayerLeavesController implements OnDestroy {
    private joinerLeavesGameEvent: EventEmitter<string> = new EventEmitter();
    private resetGameEvent: EventEmitter<string> = new EventEmitter();
    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService, private readonly gamePlayController: GamePlayController) {
        this.configureSocket();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    configureSocket(): void {
        this.socketService.on('joinerLeaveGame', (opponent: PlayerName) => {
            this.joinerLeavesGameEvent.emit(opponent.name);
        });

        this.socketService.on('cleanup', () => {
            this.gamePlayController.newMessageValue.next(null);
            this.resetGameEvent.emit();
        });
    }

    handleLeaveGame(gameId: string): void {
        const endpoint = `${environment.serverUrl}/games/${gameId}/players/${this.socketService.getId()}/leave`;
        this.http.delete(endpoint).subscribe();
    }

    subscribeToJoinerLeavesGameEvent(serviceDestroyed$: Subject<boolean>, callback: (leaverName: string) => void): void {
        this.joinerLeavesGameEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToResetGameEvent(serviceDestroyed$: Subject<boolean>, callback: () => void): void {
        this.resetGameEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }
}
