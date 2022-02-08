import { Injectable } from '@angular/core';
import { Round } from '@app/classes/round';

@Injectable({
    providedIn: 'root',
})
export default class RoundManagerService {
    currentRound: Round;
    completedRounds: Round[];
    maxRoundTime: number;

    updateRound(round: Round): void {
        this.completedRounds.push(this.currentRound);
        this.currentRound = round;
        this.startRound();
    }

    getStartGameTime(): Date {
        return this.completedRounds[0].startTime;
    }
    startRound(): void {
        throw new Error('Method not implemented.');
    }
    finishRound(): void {
        throw new Error('Method not implemented.');
    }
}
