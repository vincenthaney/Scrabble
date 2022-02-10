/* eslint-disable max-classes-per-file */
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { of } from 'rxjs';
import { CreateWaitingPageComponent } from './create-waiting-page.component';
import { HOST_WAITING_MESSAGE, OPPONENT_FOUND_MESSAGE } from './create-waiting-page.component.const';
import { CommonModule } from '@angular/common';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
@Component({
    template: '',
})
class TestComponent {}

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

describe('CreateWaitingPageComponent', () => {
    let component: CreateWaitingPageComponent;
    let fixture: ComponentFixture<CreateWaitingPageComponent>;
    const testOpponentName = 'testname';
    let gameDispatcherServiceMock: GameDispatcherService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateWaitingPageComponent, DefaultDialogComponent],
            imports: [
                HttpClientModule,
                MatProgressSpinnerModule,
                MatDialogModule,
                CommonModule,
                BrowserAnimationsModule,
                RouterTestingModule.withRoutes([
                    { path: 'game-creation', component: TestComponent },
                    { path: 'waiting-room', component: CreateWaitingPageComponent },
                    { path: 'game', component: TestComponent },
                ]),
            ],
            providers: [
                GameDispatcherService,
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateWaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameDispatcherServiceMock = TestBed.inject(GameDispatcherService);
    });

    beforeEach(() => {
        component.waitingRoomMessage = 'initialWaitingRoomMessage';
        component.opponent = 'initialOpponent';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('waitingRoomMessage should change the attributes according to the opponent name', async () => {
        component.setOpponent(testOpponentName);
        expect(component.waitingRoomMessage).toEqual(testOpponentName + OPPONENT_FOUND_MESSAGE);
        expect(component.isOpponentFound).toEqual(true);
        expect(component.opponent).toEqual(testOpponentName);
    });

    it('waitingRoomMessage should change to HostWaitingMessage when an opponent leaves the lobby', async () => {
        component.isOpponentFound = true;
        component.disconnectOpponent();
        expect(component.waitingRoomMessage).toEqual(HOST_WAITING_MESSAGE);
        expect(component.isOpponentFound).toEqual(false);
        expect(component.opponent).toEqual(undefined);
    });

    it('disconnectOpponent should not change anything if there is no opponent', async () => {
        component.opponent = undefined;
        const beforeMessage = component.waitingRoomMessage;
        component.disconnectOpponent();
        expect(component.waitingRoomMessage).toEqual(beforeMessage);
    });

    it('startButton should be enabled when an opponent is found', () => {
        component.isOpponentFound = true;
        fixture.detectChanges();
        const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
        expect(startGameButton.disabled).toBeFalsy();
    });

    it('rejectButton should be enabled when an opponent is found', () => {
        component.isOpponentFound = true;
        fixture.detectChanges();
        const rejectButton = fixture.nativeElement.querySelector('#reject-button');
        expect(rejectButton.disabled).toBeFalsy();
    });

    it('startButton should be disabled when no opponent is found', () => {
        component.isOpponentFound = false;
        fixture.detectChanges();
        const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
        expect(startGameButton.disabled).toBeTruthy();
    });

    it('reject button should be disabled  when no opponent is found', async () => {
        component.isOpponentFound = false;
        fixture.detectChanges();
        const rejectButton = fixture.nativeElement.querySelector('#reject-button');
        expect(rejectButton.disabled).toBeTruthy();
    });

    it('startButton should be disabled when the game is created and no opponent has joined it.', () => {
        const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
        expect(startGameButton.disabled).toBeTruthy();
    });

    it('rejectButton should be disabled when the game is created and no opponent has joined it.', () => {
        const rejectButton = fixture.nativeElement.querySelector('#reject-button');
        expect(rejectButton.disabled).toBeTruthy();
    });

    it('convertSolo should be enabled when the game is created and no opponent has joined it.', () => {
        const convertSoloButton = fixture.nativeElement.querySelector('#convert-solo-button');
        expect(convertSoloButton.disabled).toBeFalsy();
    });

    it('cancelButton should be enabled when the game is created and no opponent has joined it.', () => {
        const cancelButtonButton = fixture.nativeElement.querySelector('#cancel-button');
        expect(cancelButtonButton.disabled).toBeFalsy();
    });

    it('opponentLeft set the attributes correctly  and open the dialog', () => {
        const spy = spyOn(component.dialog, 'open');
        component.opponentLeft('leaver');
        expect(spy).toHaveBeenCalled();
        expect(component.waitingRoomMessage).toEqual(HOST_WAITING_MESSAGE);
        expect(component.isOpponentFound).toEqual(false);
        expect(component.opponent).toEqual(undefined);
    });

    it('clicking on the rejectButton should call handleRejection() if an opponent is found', () => {
        component.isOpponentFound = true;
        fixture.detectChanges();
        const spyDisconnect = spyOn(component, 'disconnectOpponent').and.callFake(() => {
            return;
        });

        const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleRejection')
            .withArgs(component.opponent as string)
            .and.callFake(() => {
                return;
            });
        const rejectButton = fixture.debugElement.nativeElement.querySelector('#reject-button');
        rejectButton.click();
        expect(spyDisconnect).toHaveBeenCalled();
        expect(gameDispatcherSpy).toHaveBeenCalled();
    });

    it('clicking on the rejectButton with no opponent should not call handleRejection() and disconnectOpponent', () => {
        component.isOpponentFound = false;
        component.opponent = undefined;
        fixture.detectChanges();
        const spyDisconnect = spyOn(component, 'disconnectOpponent');

        const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleRejection').and.callFake(() => {
            return;
        });
        const rejectButton = fixture.debugElement.nativeElement.querySelector('#reject-button');
        rejectButton.click();
        expect(spyDisconnect).not.toHaveBeenCalled();
        expect(gameDispatcherSpy).not.toHaveBeenCalled();
    });

    it('clicking on the startGame Button should call confirmOpponentToServer() if an opponent is found', () => {
        component.isOpponentFound = true;
        fixture.detectChanges();

        const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleConfirmation').and.callFake(() => {
            return;
        });

        const startGameButton = fixture.debugElement.nativeElement.querySelector('#start-game-button');
        startGameButton.click();

        expect(gameDispatcherSpy).toHaveBeenCalledWith(component.opponent as string);
    });

    it('clicking on the startGame Button should not call confirmOpponentToServer() if there is no opponent', () => {
        component.isOpponentFound = false;
        component.opponent = undefined;
        fixture.detectChanges();

        const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleConfirmation').and.callFake(() => {
            return;
        });

        const startGameButton = fixture.debugElement.nativeElement.querySelector('#start-game-button');
        startGameButton.click();

        expect(gameDispatcherSpy).not.toHaveBeenCalled();
    });

    it('ngOnInit should subscribe to gameDispatcherService joinRequestEvent and joinerLeaveGameEvent and router events', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spySubscribeJoinRequestEvent = spyOn(gameDispatcherServiceMock.joinRequestEvent, 'subscribe').and.returnValue(of(true) as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spySubscribeJoinerLeaveGameEvent = spyOn(gameDispatcherServiceMock.joinerLeaveGameEvent, 'subscribe').and.returnValue(of(true) as any);
        component.ngOnInit();
        expect(spySubscribeJoinRequestEvent).toHaveBeenCalled();
        expect(spySubscribeJoinerLeaveGameEvent).toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe all subscriptions', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyUnsubscribeJoinRequestEvent = spyOn(component.joinRequestSubscription, 'unsubscribe').and.returnValue(of(true) as any);
        const spyUnsubscribeJoinerLeaveGameEvent = spyOn(component.joinerLeaveGameSubscription, 'unsubscribe').and.returnValue(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            of(true) as any,
        );
        component.ngOnDestroy();
        expect(spyUnsubscribeJoinRequestEvent).toHaveBeenCalled();
        expect(spyUnsubscribeJoinerLeaveGameEvent).toHaveBeenCalled();
    });

    it('ngOnDestroy should call handleCancelGame if the isStartingGame is false', () => {
        component.isStartingGame = false;
        fixture.detectChanges();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyUnsubscribeJoinRequestEvent = spyOn(component.joinRequestSubscription, 'unsubscribe').and.returnValue(of(true) as any);
        const spyUnsubscribeJoinerLeaveGameEvent = spyOn(component.joinerLeaveGameSubscription, 'unsubscribe').and.returnValue(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            of(true) as any,
        );
        const spyCancelGame = spyOn(gameDispatcherServiceMock, 'handleCancelGame').and.callFake(() => {
            return;
        });

        component.ngOnDestroy();
        expect(spyUnsubscribeJoinRequestEvent).toHaveBeenCalled();
        expect(spyUnsubscribeJoinerLeaveGameEvent).toHaveBeenCalled();
        expect(spyCancelGame).toHaveBeenCalled();
    });

    it('setOpponent should be called when joinRequestEvent is emittted', () => {
        const emitName = 'weirdName';
        const spySetOpponent = spyOn(component, 'setOpponent').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock.joinRequestEvent.emit(emitName);
        expect(spySetOpponent).toHaveBeenCalledWith(emitName);
    });

    it('opponentLeft should be called when joinerLeaveGameEvent is emittted', () => {
        const emitName = 'weirdName';
        const spyOpponentLeft = spyOn(component, 'opponentLeft').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock.joinerLeaveGameEvent.emit(emitName);
        expect(spyOpponentLeft).toHaveBeenCalledWith(emitName);
    });
});
