import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Timer } from '@app/classes/timer';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { Observable, Subject, Subscription, timer as createTimer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'app-information-box',
    templateUrl: './information-box.component.html',
    styleUrls: ['./information-box.component.scss'],
})
export class InformationBoxComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('player1Div', { static: false }) private player1Div: ElementRef<HTMLDivElement>;
    @ViewChild('player2Div', { static: false }) private player2Div: ElementRef<HTMLDivElement>;

    player1 = { name: 'Mathilde', score: 420 };
    player2 = { name: 'Raphael', score: 69 };
    timer: Timer;
    timerSource: Observable<number>;
    timerSubscription: Subscription;
    endRoundSubscription: Subscription;
    private ngUnsubscribe: Subject<void>;
    private activePlayerBorderClass = 'active-player';

    constructor(private roundManager: RoundManagerService, public gameService: GameService) {}

    ngOnInit() {
        this.ngUnsubscribe = new Subject();
        this.timer = new Timer(0, 0);
        if (this.roundManager.timer) {
            this.roundManager.timer.pipe(takeUntil(this.ngUnsubscribe)).subscribe((timer: Timer) => this.startTimer(timer));
        }
        if (this.roundManager.endRoundEvent) {
            this.endRoundSubscription = this.roundManager.endRoundEvent.subscribe(() => this.endRound());
        }
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
        this.timerSource = createTimer(0, SECONDS_TO_MILLISECONDS);
        this.timerSubscription = this.timerSource.subscribe(() => this.timer.decrement());
        this.updateActivePlayerBorder();
    }

    endRound() {
        this.timer = new Timer(0, 0);
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    updateActivePlayerBorder(): void {
        try {
            if (!this.player1Div || !this.player2Div || !this.roundManager.getActivePlayer()) return;

            if (this.roundManager.getActivePlayer().id === this.gameService.player1.id) {
                this.player1Div.nativeElement.classList.add(this.activePlayerBorderClass);
                this.player2Div.nativeElement.classList.remove(this.activePlayerBorderClass);
            } else if (this.roundManager.getActivePlayer().id === this.gameService.player2.id) {
                this.player2Div.nativeElement.classList.add(this.activePlayerBorderClass);
                this.player1Div.nativeElement.classList.remove(this.activePlayerBorderClass);
            }
        } catch (_) {
            return;
        }
    }
}
