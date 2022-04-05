import { Action, ActionPass } from '@app/classes/actions';
import { PlayerData } from '@app/classes/communication/player-data';
import { RoundData } from '@app/classes/communication/round-data';
import Player from '@app/classes/player/player';
import { NO_FIRST_ROUND_EXISTS } from '@app/constants/services-errors';
import { CompletedRound, Round } from './round';

const SECONDS_TO_MILLISECONDS = 1000;

export default class RoundManager {
    private player1: Player;
    private player2: Player;
    private currentRound: Round;
    private completedRounds: CompletedRound[];
    private maxRoundTime: number;
    private passCounter: number;

    constructor(maxRoundTime: number, player1: Player, player2: Player) {
        this.maxRoundTime = maxRoundTime;
        this.player1 = player1;
        this.player2 = player2;
        this.completedRounds = [];
        this.passCounter = 0;
    }

    convertRoundToRoundData(round: Round): RoundData {
        const playerData: PlayerData = {
            name: round.player.name,
            id: round.player.id,
            score: round.player.score,
            tiles: round.player.tiles,
        };
        return {
            playerData,
            startTime: round.startTime,
            limitTime: round.limitTime,
        };
    }

    nextRound(actionPlayed: Action): Round {
        if (this.currentRound !== undefined) {
            this.saveCompletedRound(this.currentRound, actionPlayed);
        }
        return this.beginRound();
    }

    beginRound(): Round {
        const player = this.getNextPlayer();
        const now = new Date();
        const limit = new Date(Date.now() + this.maxRoundTime * SECONDS_TO_MILLISECONDS);
        this.currentRound = {
            player,
            startTime: now,
            limitTime: limit,
        };
        return this.currentRound;
    }

    getCurrentRound(): Round {
        return this.currentRound;
    }

    getGameStartTime(): Date {
        if (!this.completedRounds[0] && !this.currentRound) throw new Error(NO_FIRST_ROUND_EXISTS);
        return this.completedRounds[0] !== undefined ? this.completedRounds[0].startTime : this.currentRound.startTime;
    }

    getMaxRoundTime(): number {
        return this.maxRoundTime;
    }

    getPassCounter(): number {
        return this.passCounter;
    }

    private saveCompletedRound(round: Round, actionPlayed: Action): void {
        const now = new Date();
        this.passCounter = actionPlayed instanceof ActionPass ? this.passCounter + 1 : 0;
        this.completedRounds.push({ ...round, completedTime: now, actionPlayed });
    }

    private getNextPlayer(): Player {
        if (this.currentRound === undefined) {
            return Math.round(Math.random()) === 0 ? this.player1 : this.player2;
        }
        return this.currentRound.player === this.player1 ? this.player2 : this.player1;
    }
}
