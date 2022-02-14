import { Action, ActionPass } from '@app/classes/actions';
import { PlayerData } from '@app/classes/communication/player-data';
import { RoundData } from '@app/classes/communication/round-data';
import Player from '@app/classes/player/player';
import { CompletedRound, Round } from './round';
import { ERROR_GAME_NOT_STARTED } from '@app/constants/classes-errors';

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
            id: round.player.getId(),
            score: round.player.score,
            tiles: round.player.tiles,
        };
        return {
            playerData,
            startTime: round.startTime,
            limitTime: round.limitTime,
        };
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

    nextRound(actionPlayed: Action): Round {
        if (this.currentRound !== undefined) {
            this.saveCompletedRound(this.currentRound, actionPlayed);
        }

        return this.beginRound();
    }

    beginRound() {
        const player = this.getNextPlayer();
        const now = new Date();
        const limit = new Date(Date.now() + this.maxRoundTime * SECONDS_TO_MILLISECONDS);

        return (this.currentRound = {
            player,
            startTime: now,
            limitTime: limit,
        });
    }

    getCurrentRound(): Round {
        return this.currentRound;
    }

    getMaxRoundTime() {
        return this.maxRoundTime;
    }

    getPassCounter() {
        return this.passCounter;
    }

    private saveCompletedRound(round: Round, actionPlayed: Action) {
        const now = new Date();
        if (actionPlayed instanceof ActionPass) this.passCounter++;
        else this.passCounter = 0;
        this.completedRounds.push({ ...round, completedTime: now, actionPlayed });
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
