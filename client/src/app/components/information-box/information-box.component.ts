import { Component, OnDestroy } from '@angular/core';
import { Timer } from '@app/classes/timer';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { Observable, Subscription, timer as createTimer } from 'rxjs';
@Component({
    selector: 'app-information-box',
    templateUrl: './information-box.component.html',
    styleUrls: ['./information-box.component.scss'],
})
export class InformationBoxComponent implements OnDestroy {
    player1 = { name: 'Mathilde', score: 420 };
    player2 = { name: 'Raphael', score: 69 };
    timer: Timer;
    timerSource: Observable<number>;
    timerSubscription: Subscription;
    endRoundSubscription: Subscription;

    constructor(private roundManager: RoundManagerService, public gameService: GameService) {
        this.roundManager.timer.subscribe((timer: Timer) => this.startTimer(timer));
        this.endRoundSubscription = roundManager.endRoundEvent.subscribe(() => this.endRound());
    }

    ngOnDestroy(): void {
        this.timerSubscription.unsubscribe();
        this.endRoundSubscription.unsubscribe();
    }

    startTimer(timer: Timer) {
        // eslint-disable-next-line no-console
        console.log('start timer comp ' + this);
        this.timer = timer;
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }

        this.timerSource = createTimer(0, SECONDS_TO_MILLISECONDS);
        this.timerSubscription = this.timerSource.subscribe(() => this.timer.decrement());
    }

    endRound() {
        // eslint-disable-next-line no-console
        console.log('end round comp');
        this.timer = new Timer(0, 0);
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    getTimerSeconds(): string {
        return this.timer.seconds.toString().padStart(2, '0');
    }
}
