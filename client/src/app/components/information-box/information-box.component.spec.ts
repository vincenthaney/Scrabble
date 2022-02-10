/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Timer } from '@app/classes/timer';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { InformationBoxComponent } from './information-box.component';

class MockRoundManager {
    pTimerSource: BehaviorSubject<Timer> = new BehaviorSubject<Timer>(new Timer(0, 0));
    pTimer: Observable<Timer>;
    pEndRoundEvent: EventEmitter<void> = new EventEmitter();
    pActivePlayer: AbstractPlayer = new Player('mockId', 'mockName', []);

    get timerSource(): BehaviorSubject<Timer> {
        return this.pTimerSource;
    }

    get timer(): Observable<Timer> {
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
            imports: [HttpClientModule, MatCardModule],
            declarations: [InformationBoxComponent],
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
        const newTimer = new Timer(1, 0);
        mockRoundManager.timerSource.next(newTimer);
        expect(startTimerSpy).toHaveBeenCalledWith(newTimer);
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

    it('ngAfterViewInit should call updateActivePlayerBorder', () => {
        const spy = spyOn(component, 'ngAfterViewInit');
        component.ngAfterViewInit();
        expect(spy).toHaveBeenCalled();
    });

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

    it('StartTimer should call updateActivePlayerBorder', () => {
        const updateSpy = spyOn(component, 'updateActivePlayerBorder').and.callFake(() => {
            return false;
        });
        const newTimer: Timer = new Timer(1, 0);
        component.startTimer(newTimer);
        expect(updateSpy).toHaveBeenCalled();
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

    it('updateActivePlayerBorder should return false if there is no activePlayer', () => {
        spyOnProperty<any>(mockRoundManager, 'activePlayer', 'get').and.returnValue(null);

        const result = component.updateActivePlayerBorder();

        expect(result).toBeFalse();
    });

    it('updateActivePlayerBorder should set border on player1 if player1 is active', () => {
        const player1 = new Player('1', 'Player1', []);
        const player2 = new Player('2', 'Player2', []);
        spyOnProperty<any>(mockRoundManager, 'activePlayer', 'get').and.returnValue(player1);
        spyOnProperty<any>(mockGameService, 'player1', 'get').and.returnValue(player1);
        spyOnProperty<any>(mockGameService, 'player2', 'get').and.returnValue(player2);

        const result = component.updateActivePlayerBorder();

        expect(result).toBeTrue();
        expect(component['player1Div'].nativeElement.classList).toContain(component['activePlayerBorderClass']);
        expect(component['player2Div'].nativeElement.classList).not.toContain(component['activePlayerBorderClass']);
    });

    it('updateActivePlayerBorder should set border on player2 if player2 is active', () => {
        const player1 = new Player('1', 'Player1', []);
        const player2 = new Player('2', 'Player2', []);
        spyOnProperty<any>(mockRoundManager, 'activePlayer', 'get').and.returnValue(player2);
        spyOnProperty<any>(mockGameService, 'player1', 'get').and.returnValue(player1);
        spyOnProperty<any>(mockGameService, 'player2', 'get').and.returnValue(player2);

        const result = component.updateActivePlayerBorder();

        expect(result).toBeTrue();
        expect(component['player2Div'].nativeElement.classList).toContain(component['activePlayerBorderClass']);
        expect(component['player1Div'].nativeElement.classList).not.toContain(component['activePlayerBorderClass']);
    });

    it('CreateTimer should return timer from rxjs', () => {
        const timerEl = component['createTimer'](SECONDS_TO_MILLISECONDS);
        expect(typeof timerEl).toEqual(typeof timer(0, SECONDS_TO_MILLISECONDS));
    });
});
