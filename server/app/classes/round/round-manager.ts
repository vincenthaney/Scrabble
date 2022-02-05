import Player from '@app/classes/player/player';
import Round from './round';
import { ERROR_GAME_NOT_STARTED } from './round-manager-error';

const SECONDS_TO_MILLISECONDS = 1000;

export default class RoundManager {
    private player1: Player;
    private player2: Player;
    private currentRound: Round;
    private completedRounds: Round[];
    private maxRoundTime: number;

    constructor(maxRoundTime: number, player1: Player, player2: Player) {
        this.maxRoundTime = maxRoundTime;
        this.player1 = player1;
        this.player2 = player2;
        this.completedRounds = [];
    }

    getStartGameTime(): Date {
        if (this.completedRounds.length === 0) {
            if (this.currentRound) {
                return this.currentRound.startTime;
            } else {
                throw new Error(ERROR_GAME_NOT_STARTED);
            }
        } else {
            return this.completedRounds[0].startTime;
        }
    }

    nextRound(): Round {
        const player = this.getNextPlayer();
        const now = new Date();
        const limit = new Date(Date.now() + this.maxRoundTime * SECONDS_TO_MILLISECONDS);

        if (this.currentRound !== undefined) {
            this.completedRounds.push({ ...this.currentRound, completedTime: now });
        }

        return (this.currentRound = {
            player,
            startTime: now,
            limitTime: limit,
            completedTime: null,
        });
    }

    getCurrentRound() {
        return this.currentRound;
    }

    getMaxRoundTime() {
        return this.maxRoundTime;
    }

    private getNextPlayer(): Player {
        if (this.currentRound === undefined) {
            // Randomly get a player
            return Math.round(Math.random()) === 0 ? this.player1 : this.player2;
        }

        if (this.currentRound.player === this.player1) return this.player2;
        else return this.player1;
    }
}
