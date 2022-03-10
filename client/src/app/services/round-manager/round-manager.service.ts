import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActionData, ActionType } from '@app/classes/actions/action-data';
import { RoundData } from '@app/classes/communication/round-data';
import { IResetServiceData } from '@app/classes/i-reset-service-data';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Round } from '@app/classes/round';
import { Timer } from '@app/classes/timer';
import { DEFAULT_PLAYER, MINIMUM_TIMER_TIME, SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { INVALID_ROUND_DATA_PLAYER, NO_CURRENT_ROUND, NO_START_GAME_TIME } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export default class RoundManagerService implements IResetServiceData {
    gameId: string;
    localPlayerId: string;
    currentRound: Round;
    completedRounds: Round[];
    maxRoundTime: number;
    timeout: ReturnType<typeof setTimeout>;
    timer: Observable<[timer: Timer, activePlayer: AbstractPlayer]>;
    endRoundEvent: EventEmitter<void>;
    private timerSource: BehaviorSubject<[timer: Timer, activePlayer: AbstractPlayer]>;

    constructor(private gameplayController: GamePlayController, private router: Router) {
        this.initialize();
    }

    initialize(): void {
        this.completedRounds = [];
        this.timerSource = new BehaviorSubject<[timer: Timer, activePlayer: AbstractPlayer]>([new Timer(0, 0), DEFAULT_PLAYER]);
        this.timer = this.timerSource.asObservable();
        this.endRoundEvent = new EventEmitter();
    }

    convertRoundDataToRound(roundData: RoundData): Round {
        if (roundData.playerData.id && roundData.playerData.name && roundData.playerData.tiles) {
            const player = new Player(roundData.playerData.id, roundData.playerData.name, roundData.playerData.tiles);
            return {
                player,
                startTime: roundData.startTime,
                limitTime: roundData.limitTime,
                completedTime: roundData.completedTime,
            };
        }
        throw Error(INVALID_ROUND_DATA_PLAYER);
    }

    resetServiceData(): void {
        this.gameId = '';
        this.localPlayerId = '';
        this.resetRoundData();
        this.resetTimerData();
        this.endRoundEvent = new EventEmitter();
    }

    resetRoundData(): void {
        this.currentRound = null as unknown as Round;
        this.completedRounds = [];
        this.maxRoundTime = 0;
    }

    resetTimerData(): void {
        clearTimeout(this.timeout);
        this.timerSource.complete();
    }

    updateRound(round: Round): void {
        this.currentRound.completedTime = round.startTime;
        this.completedRounds.push(this.currentRound);
        this.currentRound = round;
        this.endRoundEvent.emit();
        this.startRound(this.maxRoundTime);
    }

    continueRound(round: Round): void {
        this.currentRound = round;
        this.endRoundEvent.emit();
        this.startRound(this.timeLeft(round.limitTime));
    }

    timeLeft(limitTime: Date): number {
        return Math.max((new Date(limitTime).getTime() - new Date(Date.now()).getTime()) / SECONDS_TO_MILLISECONDS, MINIMUM_TIMER_TIME);
    }

    getActivePlayer(): AbstractPlayer {
        if (!this.currentRound) {
            throw new Error(NO_CURRENT_ROUND);
        }
        return this.currentRound.player;
    }

    isActivePlayerLocalPlayer(): boolean {
        return this.getActivePlayer().id === this.localPlayerId;
    }

    getStartGameTime(): Date {
        if (!this.completedRounds[0]) throw new Error(NO_START_GAME_TIME);
        return this.completedRounds[0].startTime;
    }

    startRound(roundTime: number): void {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.roundTimeout(), roundTime * SECONDS_TO_MILLISECONDS);
        this.startTimer(roundTime);
    }

    startTimer(time: number): void {
        this.timerSource.next([Timer.convertTime(time), this.getActivePlayer()]);
    }

    roundTimeout(): void {
        if (this.router.url !== '/game' || !this.isActivePlayerLocalPlayer()) return;

        const actionPass: ActionData = {
            type: ActionType.PASS,
            input: '',
            payload: {},
        };
        this.endRoundEvent.emit();
        this.gameplayController.sendAction(this.gameId, this.getActivePlayer().id, actionPass);
    }
}
