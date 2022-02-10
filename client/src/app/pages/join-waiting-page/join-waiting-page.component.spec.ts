import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { of } from 'rxjs';
import { JoinWaitingPageComponent } from './join-waiting-page.component';

@Component({
    template: '',
})
class TestComponent {}

describe('JoinWaitingPageComponent', () => {
    let component: JoinWaitingPageComponent;
    let fixture: ComponentFixture<JoinWaitingPageComponent>;
    const opponentName = 'testName';
    let gameDispatcherServiceMock: GameDispatcherService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinWaitingPageComponent],
            imports: [
                MatDialogModule,
                MatProgressBarModule,
                BrowserAnimationsModule,
                HttpClientModule,
                RouterTestingModule.withRoutes([
                    { path: 'lobby', component: TestComponent },
                    { path: 'join-waiting', component: JoinWaitingPageComponent },
                ]),
            ],
            providers: [GameDispatcherService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinWaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameDispatcherServiceMock = TestBed.inject(GameDispatcherService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('playerRejected should open the rejected dialog when player is rejected', () => {
        const spy = spyOn(component.dialog, 'open');
        component.playerRejected(opponentName);
        expect(spy).toHaveBeenCalled();
    });

    it('hostHasCanceled should open the cancel dialog when host cancels the game', () => {
        const spy = spyOn(component.dialog, 'open');
        component.hostHasCanceled(opponentName);
        expect(spy).toHaveBeenCalled();
    });

    it('cancelButton should send to GameDispatcher service that the joining player has left', async () => {
        const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleLeaveLobby').and.callFake(() => {
            return;
        });
        const cancelButton = fixture.debugElement.nativeElement.querySelector('#cancel-button');
        cancelButton.click();
        expect(gameDispatcherSpy).toHaveBeenCalled();
    });

    it('ngOnInit should subscribe to gameDispatcherService canceledGameEvent and joinerRejectedEvent', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spySubscribeCanceledGameEvent = spyOn(gameDispatcherServiceMock.canceledGameEvent, 'subscribe').and.returnValue(of(true) as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spySubscribeJoinerRejectedEvent = spyOn(gameDispatcherServiceMock.joinerRejectedEvent, 'subscribe').and.returnValue(of(true) as any);
        // Create a new component once spies have been applied
        fixture = TestBed.createComponent(JoinWaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(spySubscribeCanceledGameEvent).toHaveBeenCalled();
        expect(spySubscribeJoinerRejectedEvent).toHaveBeenCalled();
    });

    it('hostHasCanceled should be called when canceledGameEvent is emittted', () => {
        const emitName = 'weirdName';
        const spyHostHasCanceled = spyOn(component, 'hostHasCanceled').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock.canceledGameEvent.emit(emitName);
        expect(spyHostHasCanceled).toHaveBeenCalledWith(emitName);
    });

    it('playerRejected should be called when joinerRejectedEvent is emittted', () => {
        const emitName = 'weirdName';
        const spyPlayerRejected = spyOn(component, 'playerRejected').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock.joinerRejectedEvent.emit(emitName);
        expect(spyPlayerRejected).toHaveBeenCalledWith(emitName);
    });

    it('onBeforeUnload should call be handleLeaveLobby', () => {
        const spyHandleLeaveLobby = spyOn(gameDispatcherServiceMock, 'handleLeaveLobby').and.callFake(() => {
            return;
        });
        component.onBeforeUnload();
        expect(spyHandleLeaveLobby).toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe all subscriptions', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyUnsubscribeCancelEvent = spyOn(component.canceledGameSubscription, 'unsubscribe').and.returnValue(of(true) as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyUnsubscribeRoutingEvent = spyOn(component.routingSubscription, 'unsubscribe').and.returnValue(of(true) as any);
        const spyUnsubscribeJoinerRejectedEvent = spyOn(component.joinerRejectedSubscription, 'unsubscribe').and.returnValue(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            of(true) as any,
        );
        component.ngOnDestroy();
        expect(spyUnsubscribeCancelEvent).toHaveBeenCalled();
        expect(spyUnsubscribeRoutingEvent).toHaveBeenCalled();
        expect(spyUnsubscribeJoinerRejectedEvent).toHaveBeenCalled();
    });
});
