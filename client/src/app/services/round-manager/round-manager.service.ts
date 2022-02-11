import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActionData, ActionType } from '@app/classes/actions/action-data';
import { IResetableService } from '@app/classes/i-resetable-service';
import { AbstractPlayer } from '@app/classes/player';
import { Round } from '@app/classes/round';
import { Timer } from '@app/classes/timer';
import { DEFAULT_PLAYER, SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { BehaviorSubject, Observable } from 'rxjs';
import * as ROUND_ERROR from './round-manager.service.errors';

@Injectable({
    providedIn: 'root',
})
export default class RoundManagerService implements IResetableService {
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
        this.completedRounds = [];
        this.timerSource = new BehaviorSubject<[timer: Timer, activePlayer: AbstractPlayer]>([new Timer(0, 0), DEFAULT_PLAYER]);
        this.timer = this.timerSource.asObservable();
        this.endRoundEvent = new EventEmitter();
    }

    resetServiceData(): void {
        this.gameId = '';
        this.localPlayerId = '';
        this.completedRounds = [];
        this.maxRoundTime = 0;
        clearTimeout(this.timeout);
        this.timerSource.complete();
    }

    updateRound(round: Round): void {
        this.currentRound.completedTime = round.startTime;
        this.completedRounds.push(this.currentRound);
        this.currentRound = round;
        this.startRound();
    }

    getActivePlayer(): AbstractPlayer {
        if (!this.currentRound) {
            throw new Error(ROUND_ERROR.NO_CURRENT_ROUND);
        }
        return this.currentRound.player;
    }

    isActivePlayerLocalPlayer(): boolean {
        return this.getActivePlayer().id === this.localPlayerId;
    }

    getStartGameTime(): Date {
        return this.completedRounds[0].startTime;
    }

    startRound(): void {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.roundTimeout(), this.maxRoundTime * SECONDS_TO_MILLISECONDS);
        this.startTimer();
    }

    startTimer(): void {
        this.timerSource.next([Timer.convertTime(this.maxRoundTime), this.getActivePlayer()]);
    }

    roundTimeout(): void {
        if (this.router.url !== '/game' || !this.isActivePlayerLocalPlayer()) return;

        const actionPass: ActionData = {
            type: ActionType.PASS,
            payload: {},
        };
        this.endRoundEvent.emit();
        this.gameplayController.handleAction(this.gameId, this.getActivePlayer().id, actionPass);
    }
}
