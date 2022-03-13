import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { HighScore } from '@app/classes/admin';
import SocketService from '@app/services/socket/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HighScoresController implements OnDestroy {
    private highScoresListEvent: Subject<HighScore[]> = new Subject();
    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    configureSocket(): void {
        this.socketService.on('highScoresList', (highScores: HighScore[]) => {
            this.highScoresListEvent.next(highScores);
        });
    }

    handleGetHighScores(): void {
        const endpoint = `${environment.serverUrl}/highScores/${this.socketService.getId()}`;
        this.http.get(endpoint).subscribe();
    }

    subscribeToHighScoresListEvent(serviceDestroyed$: Subject<boolean>, callback: (highScores: HighScore[]) => void): void {
        this.highScoresListEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }
}
