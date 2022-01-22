import { Injectable } from '@angular/core';
import { Round } from '@app/classes/round';

@Injectable({
    providedIn: 'root',
})
export class RoundManagerService {
    currentRound: Round;
    completedRounds: Round[];
    maxRoundTime: number;

    getStartGameTime(): Date {
        return this.completedRounds[0].startTime;
    }
    startRound(): void {
        return;
    }
    finishRound(): void {
        return;
    }
}
