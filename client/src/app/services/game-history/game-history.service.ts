import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameHistory } from '@app/classes/admin';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryService {
    constructor(private http: HttpClient) {}

    fetchGameHistories(): GameHistory[] {
        throw new Error('Method not implemented.');
    }

    resetGameHistory(): void {
        throw new Error('Method not implemented.');
    }

    addGameHistory(gameHistory: GameHistory): void {
        throw new Error('Method not implemented.');
    }
}
