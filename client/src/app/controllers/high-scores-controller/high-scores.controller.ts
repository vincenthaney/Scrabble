import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HighScore } from '@app/classes/admin';
import SocketService from '@app/services/socket-service/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HighScoresController {
    private highScoresListEvent: Subject<HighScore[]> = new Subject<HighScore[]>();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
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
