import { Injectable } from '@angular/core';
import { IPlayer } from '@app/classes/player';
import { Round } from '@app/classes/round';
import * as ROUND_ERROR from './round-manager.service.errors';
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

    getCurrentPlayer(): IPlayer {
        if (!this.currentRound) {
            throw new Error(ROUND_ERROR.NO_CURRENT_ROUND);
        }
        return this.currentRound.player;
    }

    getStartGameTime(): Date {
        return this.completedRounds[0].startTime;
    }
    startRound(): void {
        // throw new Error('Method not implemented.');
    }
    finishRound(): void {
        throw new Error('Method not implemented.');
    }
}
