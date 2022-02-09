/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterTestingModule } from '@angular/router/testing';
import { GameType } from '@app/classes/game-type';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { of } from 'rxjs';
import { LobbyPageComponent } from './lobby-page.component';

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
describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;
    let gameDispatcherServiceMock: GameDispatcherService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatInputModule,
                MatFormFieldModule,
                MatDividerModule,
                HttpClientModule,
                RouterTestingModule.withRoutes([
                    { path: 'join-waiting', component: TestComponent },
                    { path: 'lobby', component: LobbyPageComponent },
                ]),
            ],
            providers: [
                GameDispatcherService,
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
            ],
            declarations: [LobbyPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameDispatcherServiceMock = TestBed.inject(GameDispatcherService);
    });

    beforeEach(() => {
        component.lobbies = [
            { lobbyId: '1', playerName: 'Name1', gameType: GameType.Classic, dictionary: 'default', maxRoundTime: 60, canJoin: false },
            { lobbyId: '2', playerName: 'Name2', gameType: GameType.Classic, dictionary: 'default', maxRoundTime: 60, canJoin: true },
            { lobbyId: '3', playerName: 'Name3', gameType: GameType.LOG2990, dictionary: 'default', maxRoundTime: 90, canJoin: false },
        ];
        component.nameField = new NameFieldComponent();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('validateName should update canJoin attribute of the lobbies (use #1)', () => {
        component.nameField.formParameters.patchValue({ inputName: 'differentName' });
        component.validateName();
        for (const lobby of component.lobbies) {
            expect(lobby.canJoin).toBeTruthy();
        }
    });

    it('validateName should update canJoin attribute of the lobbies ( use #2)', () => {
        component.nameField.formParameters.patchValue({ inputName: 'Name1' });
        const expected = [false, true, true];
        component.validateName();
        expect(component.lobbies);
        for (let i = 0; i++; i < component.lobbies.length) {
            expect(component.lobbies[i].canJoin).toEqual(expected[i]);
        }
    });

    it('onNameChange should call validateName', () => {
        const fakeValidateName = () => {
            return false;
        };
        const spy = spyOn(component, 'validateName').and.callFake(fakeValidateName);
        component.onNameChange();
        expect(spy).toHaveBeenCalled();
    });

    it('updateLobbies should call validateName', () => {
        const fakeValidateName = () => {
            return false;
        };
        const spy = spyOn(component, 'validateName').and.callFake(fakeValidateName);
        component.updateLobbies(component.lobbies);
        expect(spy).toHaveBeenCalled();
    });

    it('joinLobby should send to GameDispatcher service to join a lobby', () => {
        const gameDispatcherSpy = spyOn(gameDispatcherServiceMock, 'handleJoinLobby').and.callFake(() => {
            return;
        });
        component.joinLobby(component.lobbies[0].lobbyId);
        expect(gameDispatcherSpy).toHaveBeenCalled();
    });

    it('lobbyFullDialog should open the dialog component', () => {
        const spy = spyOn(component.dialog, 'open');
        component.lobbyFullDialog('leaver');
        expect(spy).toHaveBeenCalled();
    });

    it('ngOnInit should subscribe to gameDispatcherService lobbiesUpdateEvent and lobbyFullEvent', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spySubscribeLobbyUpdateEvent = spyOn(gameDispatcherServiceMock.lobbiesUpdateEvent, 'subscribe').and.returnValue(of(true) as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spySubscribeLobbyFullEvent = spyOn(gameDispatcherServiceMock.lobbyFullEvent, 'subscribe').and.returnValue(of(true) as any);
        component.ngOnInit();
        expect(spySubscribeLobbyUpdateEvent).toHaveBeenCalled();
        expect(spySubscribeLobbyFullEvent).toHaveBeenCalled();
    });

    it('updateLobbies should be called when lobbiesUpdateEvent is emittted', () => {
        const emitLobbies = [
            { lobbyId: '1', playerName: 'Name1', gameType: GameType.Classic, dictionary: 'default', maxRoundTime: 60, canJoin: false },
        ];
        const spySetOpponent = spyOn(component, 'updateLobbies').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock.lobbiesUpdateEvent.emit(emitLobbies);
        expect(spySetOpponent).toHaveBeenCalledWith(emitLobbies);
    });

    it('lobbyFullDialog should be called when lobbyFullEvent is emittted', () => {
        const emitName = 'weirdName';
        const spyOpponentLeft = spyOn(component, 'lobbyFullDialog').and.callFake(() => {
            return;
        });
        gameDispatcherServiceMock.lobbyFullEvent.emit(emitName);
        expect(spyOpponentLeft).toHaveBeenCalledWith(emitName);
    });

    it('ngOnDestroy should unsubscribe all subscriptions', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyUnsubscribeUpdateEvent = spyOn(component.lobbiesUpdateSubscription, 'unsubscribe').and.returnValue(of(true) as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyUnsubscribeLobbyFullEvent = spyOn(component.lobbyFullSubscription, 'unsubscribe').and.returnValue(of(true) as any);

        component.ngOnDestroy();
        expect(spyUnsubscribeUpdateEvent).toHaveBeenCalled();
        expect(spyUnsubscribeLobbyFullEvent).toHaveBeenCalled();
    });
});
