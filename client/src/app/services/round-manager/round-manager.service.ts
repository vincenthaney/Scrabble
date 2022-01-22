import { Injectable } from '@angular/core';
import { Round } from '@app/classes/round';

@Injectable({
    providedIn: 'root',
})
export class RoundManagerService {
    currentRound: Round;
    completedRounds: Round[];
    maxRoundTime: number;

    startRound(): void {
        return;
    }
    finishRound(): void {
        return;
    }
}
