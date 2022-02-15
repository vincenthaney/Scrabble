/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import {
    DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
    DIALOG_CONTENT,
    DIALOG_TITLE,
    HOST_WAITING_MESSAGE,
    OPPONENT_FOUND_MESSAGE,
} from '@app/constants/pages-constants';
import GameDispatcherService from '@app/services/game-dispatcher/game-dispatcher.service';
import { of } from 'rxjs';
import { CreateWaitingPageComponent } from './create-waiting-page.component';
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
                HttpClientTestingModule,
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

        component.waitingRoomMessage = 'initialWaitingRoomMessage';
        component.opponentName = 'initialOpponent';
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('waitingRoomMessage should change the attributes according to the opponent name', async () => {
        component.setOpponent(testOpponentName);
        expect(component.waitingRoomMessage).toEqual(testOpponentName + OPPONENT_FOUND_MESSAGE);
        expect(component.isOpponentFound).toEqual(true);
        expect(component.opponentName).toEqual(testOpponentName);
    });

    it('waitingRoomMessage should change to HostWaitingMessage when an opponent leaves the lobby', async () => {
        component.isOpponentFound = true;
        component.disconnectOpponent();
        expect(component.waitingRoomMessage).toEqual(HOST_WAITING_MESSAGE);
        expect(component.isOpponentFound).toEqual(false);
        expect(component.opponentName).toEqual(undefined);
    });

    it('ngOnInit should subscribe to gameDispatcherService joinRequestEvent and joinerLeaveGameEvent and router events', () => {
        const spySubscribeJoinRequestEvent = spyOn(gameDispatcherServiceMock.joinRequestEvent, 'subscribe').and.returnValue(of(true) as any);
        const spySubscribeJoinerLeaveGameEvent = spyOn(gameDispatcherServiceMock.joinerLeaveGameEvent, 'subscribe').and.returnValue(of(true) as any);

        component.ngOnInit();
        expect(spySubscribeJoinRequestEvent).toHaveBeenCalled();
        expect(spySubscribeJoinerLeaveGameEvent).toHaveBeenCalled();
    });

    describe('ngOnDestroy', () => {
        it('ngOnDestroy should unsubscribe from all subscriptions', () => {
            const spyUnsubscribeJoinRequestEvent = spyOn(component.joinRequestSubscription, 'unsubscribe').and.returnValue(of(true) as any);
            const spyUnsubscribeJoinerLeaveGameEvent = spyOn(component.joinerLeaveGameSubscription, 'unsubscribe').and.returnValue(of(true) as any);

            component.ngOnDestroy();
            expect(spyUnsubscribeJoinRequestEvent).toHaveBeenCalled();
            expect(spyUnsubscribeJoinerLeaveGameEvent).toHaveBeenCalled();
        });

        it('ngOnDestroy should call handleCancelGame if the isStartingGame is false', () => {
            component.isStartingGame = false;
            const spyCancelGame = spyOn(gameDispatcherServiceMock, 'handleCancelGame').and.callFake(() => {
                return;
            });

            component.ngOnDestroy();
            expect(spyCancelGame).toHaveBeenCalled();
        });

        it('ngOnDestroy should NOT call handleCancelGame if the isStartingGame is true', () => {
            component.isStartingGame = true;
            const spyCancelGame = spyOn(gameDispatcherServiceMock, 'handleCancelGame').and.callFake(() => {
                return;
            });

            component.ngOnDestroy();
            expect(spyCancelGame).not.toHaveBeenCalled();
        });
    });

    describe('setOpponent', () => {
        it('should be called when joinRequestEvent is emittted', () => {
            const emitName = 'weirdName';
            const spySetOpponent = spyOn(component, 'setOpponent').and.callFake(() => {
                return;
            });
            gameDispatcherServiceMock.joinRequestEvent.emit(emitName);
            expect(spySetOpponent).toHaveBeenCalledWith(emitName);
        });

        it('should set attributes with right values', () => {
            component.opponentName = 'some name';
            component.waitingRoomMessage = 'some message';
            component.isOpponentFound = false;

            const newOpponentName = 'New opponent name';
            component.setOpponent(newOpponentName);

            expect(component.opponentName).toEqual(newOpponentName);
            expect(component.waitingRoomMessage).toEqual(newOpponentName + OPPONENT_FOUND_MESSAGE);
            expect(component.isOpponentFound).toBeTrue();
        });
    });

    describe('disconnectOpponent', () => {
        it('should set attributes to right values if opponentName is defined', () => {
            component.opponentName = 'some name';
            component.waitingRoomMessage = 'some message';
            component.isOpponentFound = false;

            component.disconnectOpponent();

            expect(component.opponentName).toBeUndefined();
            expect(component.waitingRoomMessage).toEqual(HOST_WAITING_MESSAGE);
            expect(component.isOpponentFound).toBeFalse();
        });

        it('should not change anything if there is no opponent', async () => {
            component.opponentName = undefined;

            const beforeWaitingMessage = 'some message';
            component.waitingRoomMessage = beforeWaitingMessage;
            component.isOpponentFound = true;

            component.disconnectOpponent();

            expect(component.opponentName).toBeUndefined();
            expect(component.waitingRoomMessage).toEqual(beforeWaitingMessage);
            expect(component.isOpponentFound).toBeTrue();
        });
    });

    describe('opponentLeft', () => {
        it('opponentLeft should call disconnectOpponent', () => {
            const spy = spyOn(component, 'disconnectOpponent');
            component.opponentLeft('leaver');
            expect(spy).toHaveBeenCalled();
        });

        it('should open the dialog', () => {
            const spy = spyOn(component.dialog, 'open');
            const leaverName = 'leaver';
            component.opponentLeft(leaverName);
            expect(spy).toHaveBeenCalledWith(DefaultDialogComponent, {
                data: {
                    title: DIALOG_TITLE,
                    content: leaverName + DIALOG_CONTENT,
                    buttons: [
                        {
                            content: DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
                            closeDialog: true,
                        },
                    ],
                },
            });
        });

        it('should be called when joinerLeaveGameEvent is emittted', () => {
            const emitName = 'weirdName';
            const spyOpponentLeft = spyOn(component, 'opponentLeft').and.callFake(() => {
                return;
            });
            gameDispatcherServiceMock.joinerLeaveGameEvent.emit(emitName);
            expect(spyOpponentLeft).toHaveBeenCalledWith(emitName);
        });
    });

    describe('confirmOpponentToServer', () => {
        it('should set isStartingGame to true', () => {
            component.isStartingGame = false;
            component.confirmOpponentToServer();
            expect(component.isStartingGame).toBeTrue();
        });

        it('should call gameDispatcher.handleConfirmation if opponentName is defined', () => {
            const opponentName = 'some name';
            component.opponentName = opponentName;
            const handleConfirmationSpy = spyOn(component.gameDispatcherService, 'handleConfirmation').and.callFake(() => {
                return;
            });
            component.confirmOpponentToServer();

            expect(handleConfirmationSpy).toHaveBeenCalledWith(opponentName);
        });

        it('should NOT call gameDispatcher.handleConfirmation if opponentName is undefined', () => {
            component.opponentName = undefined;
            const handleConfirmationSpy = spyOn(component.gameDispatcherService, 'handleConfirmation').and.callFake(() => {
                return;
            });
            component.confirmOpponentToServer();

            expect(handleConfirmationSpy).not.toHaveBeenCalled();
        });
    });

    describe('confirmRejectionToServer', () => {
        it('should call gameDispatcher.handleConfirmation and disconnectOpponent if opponentName is defined', () => {
            const opponentName = 'some name';
            component.opponentName = opponentName;
            const handleConfirmationSpy = spyOn(component.gameDispatcherService, 'handleRejection').and.callFake(() => {
                return;
            });
            const disconnectOpponentSpy = spyOn(component, 'disconnectOpponent').and.callFake(() => {
                return;
            });

            component.confirmRejectionToServer();

            expect(handleConfirmationSpy).toHaveBeenCalledWith(opponentName);
            expect(disconnectOpponentSpy).toHaveBeenCalled();
        });

        it('should NOT call gameDispatcher.handleConfirmation and disconnectOpponent if opponentName is undefined', () => {
            component.opponentName = undefined;
            const handleConfirmationSpy = spyOn(component.gameDispatcherService, 'handleRejection').and.callFake(() => {
                return;
            });
            const disconnectOpponentSpy = spyOn(component, 'disconnectOpponent').and.callFake(() => {
                return;
            });

            component.confirmRejectionToServer();

            expect(handleConfirmationSpy).not.toHaveBeenCalled();
            expect(disconnectOpponentSpy).not.toHaveBeenCalled();
        });
    });

    describe('start button', () => {
        it('should be enabled when an opponent is found', () => {
            component.isOpponentFound = true;
            fixture.detectChanges();
            const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
            expect(startGameButton.disabled).toBeFalsy();
        });

        it('should be disabled when no opponent is found', () => {
            component.isOpponentFound = false;
            fixture.detectChanges();
            const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
            expect(startGameButton.disabled).toBeTruthy();
        });

        it('should call confirmOpponentToServer() on click if not disabled', () => {
            const startGameButton = fixture.debugElement.nativeElement.querySelector('#start-game-button');
            startGameButton.disabled = false;
            fixture.detectChanges();

            const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleConfirmation').and.callFake(() => {
                return;
            });
            startGameButton.click();

            expect(gameDispatcherSpy).toHaveBeenCalledWith(component.opponentName as string);
        });

        it('clicking on the startGame Button should not call confirmOpponentToServer() if there is no opponent (it is disabled)', () => {
            const startGameButton = fixture.debugElement.nativeElement.querySelector('#start-game-button');
            startGameButton.disabled = true;
            fixture.detectChanges();

            const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleConfirmation').and.callFake(() => {
                return;
            });
            startGameButton.click();

            expect(gameDispatcherSpy).not.toHaveBeenCalled();
        });
    });

    describe('rejectButton', () => {
        it('should be enabled when an opponent is found', () => {
            component.isOpponentFound = true;
            fixture.detectChanges();
            const rejectButton = fixture.nativeElement.querySelector('#reject-button');
            expect(rejectButton.disabled).toBeFalsy();
        });

        it('should be disabled  when no opponent is found', async () => {
            component.isOpponentFound = false;
            fixture.detectChanges();
            const rejectButton = fixture.nativeElement.querySelector('#reject-button');
            expect(rejectButton.disabled).toBeTruthy();
        });

        it('should call handleRejection() if an opponent is found on click if not disabled', () => {
            const rejectButton = fixture.debugElement.nativeElement.querySelector('#reject-button');
            rejectButton.disabled = false;
            fixture.detectChanges();

            const spyDisconnect = spyOn(component, 'disconnectOpponent').and.callFake(() => {
                return;
            });
            const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleRejection')
                .withArgs(component.opponentName as string)
                .and.callFake(() => {
                    return;
                });
            rejectButton.click();

            expect(spyDisconnect).toHaveBeenCalled();
            expect(gameDispatcherSpy).toHaveBeenCalled();
        });

        it('should not call handleRejection() and disconnectOpponent on click when disabled', () => {
            const rejectButton = fixture.debugElement.nativeElement.querySelector('#reject-button');
            rejectButton.disabled = true;
            fixture.detectChanges();

            const disconnectSpy = spyOn(component, 'disconnectOpponent');
            const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleRejection').and.callFake(() => {
                return;
            });
            rejectButton.click();

            expect(disconnectSpy).not.toHaveBeenCalled();
            expect(gameDispatcherSpy).not.toHaveBeenCalled();
        });
    });

    describe('convertSolo button', () => {
        // it('should be enabled when the game is created and no opponent has joined it.', () => {
        //     const convertSoloButton = fixture.nativeElement.querySelector('#convert-solo-button');
        //     expect(convertSoloButton.disabled).toBeFalsy();
        // });

        it('should be disabled as it is not yet implemented', () => {
            const convertSoloButton = fixture.nativeElement.querySelector('#convert-solo-button');
            expect(convertSoloButton.disabled).toBeTruthy();
        });
    });

    it('cancelButton should be enabled when the game is created and no opponent has joined it.', () => {
        const cancelButtonButton = fixture.nativeElement.querySelector('#cancel-button');
        expect(cancelButtonButton.disabled).toBeFalsy();
    });
});
