import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Timer } from '@app/classes/timer';
import { MAX_TILE_PER_PLAYER, SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { Observable, Subject, Subscription, timer as timerCreationFunction } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-information-box',
    templateUrl: './information-box.component.html',
    styleUrls: ['./information-box.component.scss'],
})
export class InformationBoxComponent implements OnInit, OnDestroy, AfterViewInit {
    isPlayer1Active: boolean;
    isPlayer2Active: boolean;

    readonly maxTilesPerPlayer = MAX_TILE_PER_PLAYER;

    timer: Timer;
    timerSource: Observable<number>;
    timerSubscription: Subscription;
    endRoundSubscription: Subscription;
    private ngUnsubscribe: Subject<void>;

    constructor(private roundManager: RoundManagerService, private gameService: GameService) {}

    ngOnInit() {
        this.ngUnsubscribe = new Subject();
        this.timer = new Timer(0, 0);
        if (!this.roundManager.timer) return;
        this.roundManager.timer.pipe(takeUntil(this.ngUnsubscribe)).subscribe((timer: Timer) => {
            this.startTimer(timer);
            this.updateActivePlayerBorder();
        });

        if (!this.roundManager.endRoundEvent) return;
        this.endRoundSubscription = this.roundManager.endRoundEvent.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => this.endRound());
    }

    ngAfterViewInit() {
        this.updateActivePlayerBorder();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.timerSubscription.unsubscribe();
        this.endRoundSubscription.unsubscribe();
    }

    startTimer(timer: Timer) {
        this.timer = timer;
        this.timerSource = this.createTimer(SECONDS_TO_MILLISECONDS);
        this.timerSubscription = this.timerSource.subscribe(() => this.timer.decrement());
    }

    endRound() {
        this.timer = new Timer(0, 0);
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    updateActivePlayerBorder(): boolean {
        try {
            if (!this.roundManager.getActivePlayer()) return false;

            if (this.roundManager.getActivePlayer().id === this.gameService.player1.id) {
                this.isPlayer1Active = true;
                this.isPlayer2Active = false;
            } else if (this.roundManager.getActivePlayer().id === this.gameService.player2.id) {
                this.isPlayer2Active = true;
                this.isPlayer1Active = false;
            }
            return true;
        } catch (_) {
            return false;
        }
    }

    getPlayer1(): AbstractPlayer {
        if (!this.gameService.player1) return new Player('', 'Player1', []);
        return this.gameService.player1;
    }

    getPlayer2(): AbstractPlayer {
        if (!this.gameService.player2) return new Player('', 'Player2', []);
        return this.gameService.player2;
    }

    private createTimer(length: number): Observable<number> {
        return timerCreationFunction(0, length);
    }
}
