import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Timer } from '@app/classes/timer/timer';
import { IconName } from '@app/components/icon/icon.component.type';
import { LOCAL_PLAYER_ICON } from '@app/constants/components-constants';
import { MAX_TILES_PER_PLAYER, PLAYER_1_INDEX, PLAYER_2_INDEX, SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { Observable, Subject, Subscription, timer as timerCreationFunction } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-information-box',
    templateUrl: './information-box.component.html',
    styleUrls: ['./information-box.component.scss'],
})
export class InformationBoxComponent implements OnInit, OnDestroy {
    readonly maxTilesPerPlayer;
    isPlayer1Active: boolean;
    isPlayer2Active: boolean;
    isPlayer1: boolean;
    localPlayerIcon: IconName;
    timer: Timer;

    timerSource: Observable<number>;
    timerSubscription: Subscription;
    private componentDestroyed$: Subject<boolean>;

    constructor(
        private roundManager: RoundManagerService,
        private gameService: GameService,
        private gameViewEventManagerService: GameViewEventManagerService,
    ) {
        this.maxTilesPerPlayer = MAX_TILES_PER_PLAYER;
    }

    ngOnInit(): void {
        this.timer = new Timer(0, 0);
        this.componentDestroyed$ = new Subject();
        this.gameViewEventManagerService.subscribeToGameViewEvent('reRender', this.componentDestroyed$, () => {
            this.ngOnDestroy();
            this.ngOnInit();
            this.updateActivePlayerBorder(this.roundManager.getActivePlayer());
        });
        this.gameViewEventManagerService.subscribeToGameViewEvent('gameInitialized', this.componentDestroyed$, () => {
            this.localPlayerIcon = this.getLocalPlayerIcon();
        });

        if (!this.gameService.isGameSetUp) return;
        this.setupGame();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    getPlayer1(): AbstractPlayer {
        const player1 = this.gameService.getPlayerByNumber(PLAYER_1_INDEX);
        return player1 ? player1 : new Player('', 'Player1', []);
    }

    getPlayer2(): AbstractPlayer {
        const player2 = this.gameService.getPlayerByNumber(PLAYER_2_INDEX);
        return player2 ? player2 : new Player('', 'Player2', []);
    }

    private setupGame(): void {
        if (this.roundManager.timer) {
            this.roundManager.timer.pipe(takeUntil(this.componentDestroyed$)).subscribe(([timer, activePlayer]) => {
                this.startTimer(timer);
                this.updateActivePlayerBorder(activePlayer);
            });
        }
        this.roundManager.subscribeToEndRoundEvent(this.componentDestroyed$, () => this.endRound());
        this.isPlayer1 = this.checkIfIsPlayer1();
    }

    private startTimer(timer: Timer): void {
        this.timer = timer;
        this.timerSource = this.createTimer(SECONDS_TO_MILLISECONDS);
        this.timerSubscription = this.timerSource.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => this.timer.decrement());
    }

    private endRound(): void {
        this.timer = new Timer(0, 0);
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    private updateActivePlayerBorder(activePlayer: AbstractPlayer | undefined): void {
        const player1 = this.getPlayer1();
        const player2 = this.getPlayer2();
        if (!activePlayer) {
            this.isPlayer1Active = false;
            this.isPlayer2Active = false;
            return;
        }
        this.isPlayer1Active = player1 && activePlayer.id === player1.id;
        this.isPlayer2Active = player2 && activePlayer.id === player2.id;
    }

    private createTimer(length: number): Observable<number> {
        return timerCreationFunction(0, length);
    }

    private checkIfIsPlayer1(): boolean {
        return this.gameService.getLocalPlayer() === this.gameService.getPlayerByNumber(PLAYER_1_INDEX);
    }

    private getLocalPlayerIcon(): IconName {
        return LOCAL_PLAYER_ICON[Math.floor(Math.random() * LOCAL_PLAYER_ICON.length)];
    }
}
