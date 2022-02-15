/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Timer } from '@app/classes/timer';
import { IconComponent } from '@app/components/icon/icon.component';
import { DEFAULT_PLAYER, SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { InformationBoxComponent } from './information-box.component';

class MockRoundManager {
    pTimerSource: BehaviorSubject<[timer: Timer, activePlayer: AbstractPlayer]> = new BehaviorSubject<[timer: Timer, activePlayer: AbstractPlayer]>([
        new Timer(0, 0),
        DEFAULT_PLAYER,
    ]);
    pTimer: Observable<[timer: Timer, activePlayer: AbstractPlayer]>;
    pEndRoundEvent: EventEmitter<void> = new EventEmitter();
    pActivePlayer: AbstractPlayer = new Player('mockId', 'mockName', []);

    get timerSource(): BehaviorSubject<[timer: Timer, activePlayer: AbstractPlayer]> {
        return this.pTimerSource;
    }

    get timer(): Observable<[timer: Timer, activePlayer: AbstractPlayer]> {
        return this.timerSource.asObservable();
    }
    get endRoundEvent(): EventEmitter<void> {
        return this.pEndRoundEvent;
    }

    get activePlayer(): AbstractPlayer {
        return this.pActivePlayer;
    }

    getActivePlayer(): AbstractPlayer | null {
        return this.activePlayer;
    }
}

class MockGameService {
    pPlayer1: AbstractPlayer = new Player('id1', 'name1', []);
    pPlayer2: AbstractPlayer = new Player('id2', 'name2', []);

    get player1(): AbstractPlayer {
        return this.pPlayer1;
    }

    get player2(): AbstractPlayer {
        return this.pPlayer2;
    }

    getLocalPlayer(): AbstractPlayer {
        return this.pPlayer1;
    }
}

describe('InformationBoxComponent', () => {
    let component: InformationBoxComponent;
    let fixture: ComponentFixture<InformationBoxComponent>;
    let mockGameService: MockGameService;
    let mockRoundManager: MockRoundManager;

    beforeEach(() => {
        mockGameService = new MockGameService();
        mockRoundManager = new MockRoundManager();
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatCardModule, MatTooltipModule],
            declarations: [InformationBoxComponent, IconComponent],
            providers: [
                { provide: GameService, useValue: mockGameService },
                { provide: RoundManagerService, useValue: mockRoundManager },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InformationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should create ngUnsubscribe object', () => {
        spyOnProperty<any>(mockRoundManager, 'timer', 'get').and.returnValue(null);
        spyOnProperty<any>(mockRoundManager, 'endRoundEvent', 'get').and.returnValue(null);
        component.ngOnInit();
        expect(component['ngUnsubscribe']).toBeTruthy();
    });

    it('ngOnInit should create Timer object', () => {
        spyOnProperty<any>(mockRoundManager, 'timer', 'get').and.returnValue(null);
        spyOnProperty<any>(mockRoundManager, 'endRoundEvent', 'get').and.returnValue(null);
        component.ngOnInit();
        expect(component.timer).toBeTruthy();
    });

    it('ngOnInit should subscribe to RoundManager timer property', () => {
        const timerObs = new Observable<Timer>();
        const pipedObservable = timerObs.pipe();
        const pipedSpy = spyOn(pipedObservable, 'subscribe');
        spyOnProperty<any>(mockRoundManager, 'timer', 'get').and.returnValue(timerObs);
        spyOn(mockRoundManager.timer, 'pipe').and.returnValue(pipedObservable);
        component.ngOnInit();
        expect(pipedSpy).toHaveBeenCalled();
    });

    it('ngOnInit timer subscription should call startTimer', () => {
        const startTimerSpy = spyOn(component, 'startTimer').and.callFake(() => {
            return;
        });
        spyOn(component, 'updateActivePlayerBorder').and.callFake(() => {
            return false;
        });
        const newTimer = new Timer(1, 0);
        mockRoundManager.timerSource.next([newTimer, DEFAULT_PLAYER]);
        expect(startTimerSpy).toHaveBeenCalledWith(newTimer);
    });

    it('ngOnInit timer subscription should call updateActivePlayerBorder', () => {
        spyOn(component, 'startTimer').and.callFake(() => {
            return;
        });
        const updateBorderSpy = spyOn(component, 'updateActivePlayerBorder').and.callFake(() => {
            return false;
        });
        const newTimer = new Timer(1, 0);
        mockRoundManager.timerSource.next([newTimer, DEFAULT_PLAYER]);
        expect(updateBorderSpy).toHaveBeenCalled();
    });

    it('ngOnInit should subscribe to RoundManager endRoundEvent', () => {
        const subscribeSpy = spyOn(mockRoundManager.endRoundEvent, 'subscribe');
        component.ngOnInit();
        expect(subscribeSpy).toHaveBeenCalled();

        const endRoundSpy = spyOn(component, 'endRound');
        mockRoundManager.endRoundEvent.emit();
        expect(endRoundSpy).toHaveBeenCalled();
    });

    it('ngOnInit endRoundEvent subscription should call endRound', () => {
        const endRoundSpy = spyOn(component, 'endRound');
        mockRoundManager.endRoundEvent.emit();
        expect(endRoundSpy).toHaveBeenCalled();
    });

    it('ngAfterViewInit should call updateActivePlayerBorder', fakeAsync(() => {
        const spy = spyOn(component, 'updateActivePlayerBorder');
        component.ngAfterViewInit();
        tick(1);
        expect(spy).toHaveBeenCalled();
    }));

    it('ngOnDestroy should unsubscribe from subscriptions', () => {
        const ngUnsubscribeNextSpy = spyOn(component['ngUnsubscribe'], 'next');
        const ngUnsubscribeCompleteSpy = spyOn(component['ngUnsubscribe'], 'complete');
        const timerSubscriptionSpy = spyOn(component.timerSubscription, 'unsubscribe');
        const endRoundSubscriptionSpy = spyOn(component.endRoundSubscription, 'unsubscribe');

        component.ngOnDestroy();
        expect(ngUnsubscribeNextSpy).toHaveBeenCalled();
        expect(ngUnsubscribeCompleteSpy).toHaveBeenCalled();
        expect(timerSubscriptionSpy).toHaveBeenCalled();
        expect(endRoundSubscriptionSpy).toHaveBeenCalled();
    });

    it('StartTimer should update timer attribute', () => {
        const observable = new Observable<number>();
        spyOn<any>(component, 'createTimer').and.returnValue(observable);
        spyOn(observable, 'subscribe').and.callFake(() => {
            return new Subscription();
        });
        spyOn(component, 'updateActivePlayerBorder').and.callFake(() => {
            return false;
        });
        const newTimer: Timer = new Timer(1, 0);
        component.startTimer(newTimer);
        expect(component.timer).toEqual(newTimer);
    });

    it('StartTimer should create TimerSource', () => {
        const observable = new Observable<number>();
        spyOn<any>(component, 'createTimer').and.returnValue(observable);
        spyOn(observable, 'subscribe').and.callFake(() => {
            return new Subscription();
        });
        spyOn(component, 'updateActivePlayerBorder').and.callFake(() => {
            return false;
        });
        const newTimer: Timer = new Timer(1, 0);
        component.startTimer(newTimer);
        expect(component.timerSource).toEqual(observable);
    });

    it('StartTimer should subscribe timerSubscription to timerSource and call timer.decrement', () => {
        const newTimer: Timer = new Timer(1, 0);
        spyOn(component, 'updateActivePlayerBorder').and.callFake(() => {
            return false;
        });
        component.startTimer(newTimer);
        expect(component.timerSubscription).toBeTruthy();
    });

    it('EndRound should set Timer to 0:00', () => {
        component.endRound();
        expect(component.timer).toEqual(new Timer(0, 0));
    });

    it('EndRound should unsubscribe from timerSubscription', () => {
        component.startTimer(new Timer(1, 0));
        const spy = spyOn(component.timerSubscription, 'unsubscribe');
        component.endRound();
        expect(spy).toHaveBeenCalled();
    });

    it('updateActivePlayerBorder should set border on player1 if player1 is active', () => {
        const player1 = new Player('1', 'Player1', []);
        const player2 = new Player('2', 'Player2', []);
        spyOnProperty<any>(mockGameService, 'player1', 'get').and.returnValue(player1);
        spyOnProperty<any>(mockGameService, 'player2', 'get').and.returnValue(player2);

        component.updateActivePlayerBorder(player1);

        expect(component.isPlayer1Active).toBeTrue();
        expect(component.isPlayer2Active).toBeFalse();
    });

    it('updateActivePlayerBorder should set border on player2 if player2 is active', () => {
        const player1 = new Player('1', 'Player1', []);
        const player2 = new Player('2', 'Player2', []);
        spyOnProperty<any>(mockGameService, 'player1', 'get').and.returnValue(player1);
        spyOnProperty<any>(mockGameService, 'player2', 'get').and.returnValue(player2);

        component.updateActivePlayerBorder(player2);

        expect(component.isPlayer2Active).toBeTrue();
        expect(component.isPlayer1Active).toBeFalse();
    });

    it('CreateTimer should return timer from rxjs', () => {
        const timerEl = component['createTimer'](SECONDS_TO_MILLISECONDS);
        expect(typeof timerEl).toEqual(typeof timer(0, SECONDS_TO_MILLISECONDS));
    });
});
