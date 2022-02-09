import { EventEmitter, Injectable } from '@angular/core';
import { ActionData, ActionType } from '@app/classes/actions/action-data';
import { IResetableService } from '@app/classes/i-resetable-service';
import { AbstractPlayer } from '@app/classes/player';
import { Round } from '@app/classes/round';
import { Timer } from '@app/classes/timer';
import { convertTime } from '@app/classes/utils';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { BehaviorSubject, Observable } from 'rxjs';
import * as ROUND_ERROR from './round-manager.service.errors';

@Injectable({
    providedIn: 'root',
})
export default class RoundManagerService implements IResetableService {
    gameId: string;
    currentRound: Round;
    completedRounds: Round[];
    maxRoundTime: number;
    timeout: ReturnType<typeof setTimeout>;
    timer: Observable<Timer>;
    endRoundEvent: EventEmitter<void>;
    private timerSource: BehaviorSubject<Timer>;

    constructor(private gameplayController: GamePlayController) {
        this.timerSource = new BehaviorSubject<Timer>(new Timer(0, 0));
        this.timer = this.timerSource.asObservable();
        this.endRoundEvent = new EventEmitter();
    }

    resetServiceData(): void {
        this.gameId = '';
        this.completedRounds = [];
        this.maxRoundTime = 0;
        clearTimeout(this.timeout);
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

    getStartGameTime(): Date {
        return this.completedRounds[0].startTime;
    }

    startRound(): void {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.roundTimeout(), this.maxRoundTime * SECONDS_TO_MILLISECONDS);
        this.startTimer();
    }

    startTimer(): void {
        this.timerSource.next(convertTime(this.maxRoundTime));
    }

    roundTimeout(): void {
        const actionPass: ActionData = {
            type: ActionType.PASS,
            payload: {},
        };
        this.endRoundEvent.emit();
        this.gameplayController.handleAction(this.gameId, this.getActivePlayer().id, actionPass);
    }
}
