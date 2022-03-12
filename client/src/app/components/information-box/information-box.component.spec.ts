/* eslint-disable max-lines */
/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AbstractPlayer, Player } from '@app/classes/player';
import { PlayerContainer } from '@app/classes/player/player-container';
import { Timer } from '@app/classes/timer';
import { IconComponent } from '@app/components/icon/icon.component';
import { LOCAL_PLAYER_ICON } from '@app/constants/components-constants';
import { DEFAULT_PLAYER, SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InformationBoxComponent } from './information-box.component';
import SpyObj = jasmine.SpyObj;
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

describe('InformationBoxComponent', () => {
    let component: InformationBoxComponent;
    let fixture: ComponentFixture<InformationBoxComponent>;
    let gameServiceSpy: SpyObj<GameService>;
    let mockRoundManager: MockRoundManager;
    let gameViewEventManagerSpy: SpyObj<GameViewEventManagerService>;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['getPlayerByNumber', 'getLocalPlayer']);
        mockRoundManager = new MockRoundManager();

        const reRender$ = new Subject();
        gameViewEventManagerSpy = jasmine.createSpyObj('GameViewEventManagerService', ['emitGameViewEvent', 'subscribeToGameViewEvent']);
        gameViewEventManagerSpy.emitGameViewEvent.and.callFake((eventType: string) => {
            switch (eventType) {
                case 'reRender':
                    reRender$.next();
                    break;
            }
        });

        gameViewEventManagerSpy.subscribeToGameViewEvent.and.callFake((eventType: string, destroy$: Observable<boolean>, next: any): Subscription => {
            switch (eventType) {
                case 'reRender':
                    return reRender$.pipe(takeUntil(destroy$)).subscribe(next);
            }
            return new Subscription();
        });
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatCardModule, MatTooltipModule],
            declarations: [InformationBoxComponent, IconComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: RoundManagerService, useValue: mockRoundManager },
                { provide: GameViewEventManagerService, useValue: gameViewEventManagerSpy },
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

    describe('ngOnInit', () => {
        beforeEach(() => {
            gameServiceSpy.isGameSetUp = true;
        });

        it('ngOnInit should create ngUnsubscribe object', () => {
            spyOnProperty<any>(mockRoundManager, 'timer', 'get').and.returnValue(null);
            spyOnProperty<any>(mockRoundManager, 'endRoundEvent', 'get').and.returnValue(null);
            component.ngOnInit();
            expect(component['componentDestroyed$']).toBeTruthy();
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
            component.ngOnInit();
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
            component.ngOnInit();
            const newTimer = new Timer(1, 0);
            mockRoundManager.timerSource.next([newTimer, DEFAULT_PLAYER]);
            expect(updateBorderSpy).toHaveBeenCalled();
        });

        it('ngOnInit should subscribe to RoundManager endRoundEvent', () => {
            const event = mockRoundManager.endRoundEvent;
            const pipedObservable: Observable<void> = event.pipe();
            const pipedSpy = spyOn(pipedObservable, 'subscribe');
            // eslint-disable-next-line @typescript-eslint/ban-types
            spyOn(mockRoundManager.endRoundEvent, 'pipe').and.returnValue(pipedObservable as unknown as Observable<{}>);
            component.ngOnInit();
            expect(pipedSpy).toHaveBeenCalled();
        });

        it('ngOnInit should NOT subscribe to RoundManager endRoundEvent if roundManager.endRoundEvent is undefined', () => {
            const subscribeSpy = spyOn(mockRoundManager.endRoundEvent, 'subscribe');
            spyOnProperty<any>(mockRoundManager, 'endRoundEvent', 'get').and.returnValue(undefined);
            component.ngOnInit();
            expect(subscribeSpy).not.toHaveBeenCalled();
        });

        it('ngOnInit endRoundEvent subscription should call endRound', () => {
            const endRoundSpy = spyOn(component, 'endRound');
            component.ngOnInit();
            mockRoundManager.endRoundEvent.emit();
            expect(endRoundSpy).toHaveBeenCalled();
        });

        it('ngOnInit endRoundEvent subscription should call the functions to rerender the component', () => {
            const ngOnDestroySpy = spyOn(component, 'ngOnDestroy');
            const ngOnInitSpy = spyOn(component, 'ngOnInit');
            const ngAfterViewInitSpy = spyOn(component, 'ngAfterViewInit');

            gameViewEventManagerSpy.emitGameViewEvent('reRender');

            expect(ngOnDestroySpy).toHaveBeenCalled();
            expect(ngOnInitSpy).toHaveBeenCalled();
            expect(ngAfterViewInitSpy).toHaveBeenCalled();
        });
    });

    it('ngAfterViewInit should call updateActivePlayerBorder', fakeAsync(() => {
        const spy = spyOn(component, 'updateActivePlayerBorder');
        component.ngAfterViewInit();
        tick(1);
        expect(spy).toHaveBeenCalled();
    }));

    describe('ngOndestroy', () => {
        beforeEach(() => {
            spyOnProperty<any>(mockRoundManager, 'endRoundEvent', 'get').and.returnValue(null);
            spyOnProperty<any>(mockRoundManager, 'timer', 'get').and.returnValue(null);
        });

        it('should always call next and complete on ngUnsubscribe', () => {
            const ngUnsubscribeNextSpy = spyOn(component['componentDestroyed$'], 'next');
            const ngUnsubscribeCompleteSpy = spyOn(component['componentDestroyed$'], 'complete');

            component.ngOnDestroy();
            expect(ngUnsubscribeNextSpy).toHaveBeenCalled();
            expect(ngUnsubscribeCompleteSpy).toHaveBeenCalled();
        });
    });

    describe('startTimer', () => {
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
    });

    describe('endRound', () => {
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

        it('EndRound should not unsubscribe if timerSubscription is not defined', () => {
            component.startTimer(new Timer(1, 0));
            const spy = spyOn(component.timerSubscription, 'unsubscribe');
            component.timerSubscription = undefined as unknown as Subscription;
            // spyOnProperty<any>(component, 'timerSubscription', 'set').and.returnValue(null);
            component.endRound();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('updateActivePlayerBorder', () => {
        let player1: Player;
        let player2: Player;
        beforeEach(() => {
            player1 = new Player('1', 'Player1', []);
            player2 = new Player('2', 'Player2', []);
            gameServiceSpy.getPlayerByNumber.and.callFake((id: number) => {
                return id === 1 ? player1 : player2;
            });
        });

        it('updateActivePlayerBorder should set no border if provided active player is undefined', () => {
            component.updateActivePlayerBorder(undefined);

            expect(component.isPlayer1Active).toBeFalse();
            expect(component.isPlayer2Active).toBeFalse();
        });

        it('updateActivePlayerBorder should set border on player1 if player1 is active', () => {
            component.updateActivePlayerBorder(player1);

        it('updateActivePlayerBorder should not set any border if there is no active player', () => {
            component.updateActivePlayerBorder(undefined);
            expect(component.isPlayer1Active).toBeFalse();
            expect(component.isPlayer2Active).toBeFalse();
        });

        it('updateActivePlayerBorder should set border on player1 if player1 is active', () => {
            component.updateActivePlayerBorder(PLAYER1);
            expect(component.isPlayer1Active).toBeTrue();
            expect(component.isPlayer2Active).toBeFalse();
        });

        it('updateActivePlayerBorder should set border on player2 if player2 is active', () => {
            component.updateActivePlayerBorder(player2);

            expect(component.isPlayer2Active).toBeTrue();
            expect(component.isPlayer1Active).toBeFalse();
        });
    });

    describe('getPlayer', () => {
        beforeEach(() => {
            gameServiceSpy['playerContainer'] = new PlayerContainer(DEFAULT_PLAYER.id);
        });

        it('getPlayer1 should return current gameservice player1 if it exists', () => {
            gameServiceSpy.getPlayerByNumber.and.returnValue(DEFAULT_PLAYER);
            expect(component.getPlayer1()).toEqual(DEFAULT_PLAYER);
        });

        it('getPlayer1 should return a new player if gameservice player1 does not exist', () => {
            gameServiceSpy.getPlayerByNumber.and.returnValue(undefined as unknown as AbstractPlayer);
            expect(component.getPlayer1()).toEqual(new Player('', 'Player1', []));
        });

        it('getPlayer2 should return current gameservice player2 if it exists', () => {
            gameServiceSpy.getPlayerByNumber.and.returnValue(DEFAULT_PLAYER);
            expect(component.getPlayer2()).toEqual(DEFAULT_PLAYER);
        });

        it('getPlayer2 should return a new player if gameservice player2 does not exist', () => {
            gameServiceSpy.getPlayerByNumber.and.returnValue(undefined as unknown as AbstractPlayer);
            expect(component.getPlayer2()).toEqual(new Player('', 'Player2', []));
        });
    });

    it('CreateTimer should return timer from rxjs', () => {
        const timerEl = component['createTimer'](SECONDS_TO_MILLISECONDS);
        expect(typeof timerEl).toEqual(typeof timer(0, SECONDS_TO_MILLISECONDS));
    });

    it('checkIfIsPlayer1 should return true if player1 is localPlayer', () => {
        gameServiceSpy.getPlayerByNumber.and.returnValue(DEFAULT_PLAYER);
        gameServiceSpy.getLocalPlayer.and.returnValue(DEFAULT_PLAYER);
        expect(component['checkIfIsPlayer1']()).toEqual(true);
    });

    it('checkIfIsPlayer1 should return false if player1 is not localPlayer', () => {
        gameServiceSpy.getPlayerByNumber.and.returnValue(DEFAULT_PLAYER);
        gameServiceSpy.getLocalPlayer.and.returnValue(new Player('id2', 'name of player2', []));
        expect(component['checkIfIsPlayer1']()).toEqual(false);
    });

    it('getLocalPlayericon should return an icon from the list LOCAL_PLAYER_ICON', () => {
        const chosenIcon = component['getLocalPlayerIcon']();
        expect(LOCAL_PLAYER_ICON.includes(chosenIcon)).toBeTrue();
    });
});
