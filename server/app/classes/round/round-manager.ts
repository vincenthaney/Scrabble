import Round from './round';

export default class RoundManager {
    nextRound() {
        throw new Error('Method not implemented.');
    }
    currentRound: Round;
    // private completedRounds: Round[];
    // private maxRoundTime: number;

    // constructor(maxRoundTime: number) {
    // this.maxRoundTime = maxRoundTime;
    // }

    getStartGameTime(): Date {
        throw new Error('Method not implemented.');
    }
    startRound(): Round {
        throw new Error('Method not implemented.');
    }
    finishRound(): void {
        throw new Error('Method not implemented.');
    }
}
