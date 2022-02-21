import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Timer } from '@app/classes/timer';
import { IconName } from '@app/components/icon/icon.component.type';
import { LOCAL_PLAYER_ICON } from '@app/constants/components-constants';
import { MAX_TILE_PER_PLAYER, SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
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
    isPlayer1: boolean;
    localPlayerIcon: IconName;

    readonly maxTilesPerPlayer = MAX_TILE_PER_PLAYER;

    timer: Timer;
    timerSource: Observable<number>;
    timerSubscription: Subscription;
    private componentDestroyed$: Subject<boolean>;

    constructor(
        private roundManager: RoundManagerService,
        private gameService: GameService,
        private gameViewEventManagerService: GameViewEventManagerService,
    ) {}

    ngOnInit(): void {
        this.timer = new Timer(0, 0);
        this.componentDestroyed$ = new Subject();
        this.gameViewEventManagerService.subscribeToReRender(this.componentDestroyed$, () => {
            this.ngOnDestroy();
            this.ngOnInit();
            this.ngAfterViewInit();
        });

        if (this.gameService.gameIsSetUp) {
            if (!this.roundManager.timer) return;

            if (this.roundManager.timer)
                this.roundManager.timer.pipe(takeUntil(this.componentDestroyed$)).subscribe(([timer, activePlayer]) => {
                    this.startTimer(timer);
                    this.updateActivePlayerBorder(activePlayer);
                });
            if (!this.roundManager.endRoundEvent) return;
            this.roundManager.endRoundEvent.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => this.endRound());

            this.isPlayer1 = this.checkIfIsPlayer1();
            this.localPlayerIcon = this.getLocalPlayerIcon();
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.updateActivePlayerBorder(this.roundManager.getActivePlayer()), 0);
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    startTimer(timer: Timer): void {
        this.timer = timer;
        this.timerSource = this.createTimer(SECONDS_TO_MILLISECONDS);
        this.timerSubscription = this.timerSource.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => this.timer.decrement());
    }

    endRound(): void {
        this.timer = new Timer(0, 0);
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    updateActivePlayerBorder(activePlayer: AbstractPlayer | undefined): void {
        if (!activePlayer) {
            this.isPlayer1Active = false;
            this.isPlayer2Active = false;
        } else if (activePlayer.id === this.gameService.player1.id) {
            this.isPlayer1Active = true;
            this.isPlayer2Active = false;
        } else if (activePlayer.id === this.gameService.player2.id) {
            this.isPlayer2Active = true;
            this.isPlayer1Active = false;
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

    private checkIfIsPlayer1(): boolean {
        return this.gameService.getLocalPlayer() === this.gameService.player1;
    }

    private getLocalPlayerIcon(): IconName {
        return LOCAL_PLAYER_ICON[Math.floor(Math.random() * LOCAL_PLAYER_ICON.length)];
    }
}
