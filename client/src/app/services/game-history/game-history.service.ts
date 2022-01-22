import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameHistory } from '@app/classes/admin/game-history';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryService {
    constructor(private http: HttpClient) {}

    fetchGameHistories(): GameHistory[] {
        return [];
    }

    resetGameHistory(): void {
        return;
    }

    addGameHistory(gameHistory: GameHistory): void {
        return;
    }
}
