/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { AbstractPlayer, Player } from '@app/classes/player';
import { Timer } from '@app/classes/timer';
import { GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { Observable, Subscription } from 'rxjs';
import { InformationBoxComponent } from './information-box.component';
import SpyObj = jasmine.SpyObj;

class MockRoundManager {
    timer: Observable<Timer> = new Observable();
    endRoundEvent: EventEmitter<void> = new EventEmitter();
    getActivePlayer(): AbstractPlayer {
        return new Player('mockId', 'mockName', []);
    }
}

describe('InformationBoxComponent', () => {
    let component: InformationBoxComponent;
    let fixture: ComponentFixture<InformationBoxComponent>;
    let gameServiceSpy: SpyObj<GameService>;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, MatCardModule],
            declarations: [InformationBoxComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: RoundManagerService, useClass: MockRoundManager },
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

    it('StartTimer should update timer attribute', () => {
        const observable = new Observable<number>();
        spyOn<any>(component, 'createTimer').and.returnValue(observable);
        spyOn(observable, 'subscribe').and.callFake(() => {
            return new Subscription();
        });
        spyOn(component, 'updateActivePlayerBorder').and.callFake(() => {
            return;
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
            return;
        });
        const newTimer: Timer = new Timer(1, 0);
        component.startTimer(newTimer);
        expect(component.timerSource).toEqual(observable);
    });

    it('StartTimer should subscribe timerSubscription to timerSource and call timer.decrement', () => {
        const newTimer: Timer = new Timer(1, 0);
        spyOn(component, 'updateActivePlayerBorder').and.callFake(() => {
            return;
        });
        component.startTimer(newTimer);
        expect(component.timerSubscription).toBeTruthy();
    });

    it('StartTimer should call updateActivePlayerBorder', () => {
        const updateSpy = spyOn(component, 'updateActivePlayerBorder').and.callFake(() => {
            return;
        });
        const newTimer: Timer = new Timer(1, 0);
        component.startTimer(newTimer);
        expect(updateSpy).toHaveBeenCalled();
    });
});
