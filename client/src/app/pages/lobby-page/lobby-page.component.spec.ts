/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameType } from '@app/classes/game-type';
import { IconComponent } from '@app/components/icon/icon.component';
import { LobbyInfoComponent } from '@app/components/lobby-info/lobby-info.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { LobbyPageComponent } from './lobby-page.component';

export class GameDispatcherServiceSpy extends GameDispatcherService {
    handleLobbyListRequest() {
        // eslint-disable-next-line no-console
        console.log('handleLobbyListRequest');
        return;
    }
    handleJoinLobby() {
        return;
    }
    // lobbiesUpdateEvent: {subscribe: createSpy('lobbiesUpdateEvent subscribe')};
    // lobbiesUpdateEvent
}

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

    const gameDispatcherSpy = jasmine.createSpyObj('GameDispatcherService', ['handleLobbyListRequest', 'handleJoinLobby']);

    gameDispatcherSpy.handleLobbyListRequest.and.callFake(() => {
        console.log('handleLobbyListRequest');
        return;
    });
    gameDispatcherSpy.handleJoinLobby.and.callFake(() => {
        console.log('handleLobbyListRequest');
        return;
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LobbyPageComponent, NameFieldComponent, LobbyInfoComponent, IconComponent],
            imports: [
                MatInputModule,
                MatFormFieldModule,
                MatDividerModule,
                MatDialogModule,
                MatTooltipModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                RouterTestingModule.withRoutes([
                    { path: 'join-waiting', component: TestComponent },
                    { path: 'lobby', component: LobbyPageComponent },
                ]),
            ],
            providers: [
                {
                    provide: GameDispatcherService,
                    useValue: gameDispatcherSpy,
                },
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
                SocketService,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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
        expect(component.lobbies).toBeTruthy();
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

    it('joinLobby should send to GameDispatcher service to join a lobby', async () => {
        // const gameDispatcherSpy = jasmine.createSpyObj('GameDispatcherService', ['handleJoinLobby']);
        component.joinLobby(component.lobbies[0].lobbyId);
        expect(gameDispatcherSpy.handleJoinLobby).toHaveBeenCalled();
    });
});
