import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
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
import { LobbyPageComponent } from './lobby-page.component';

@Component({
    template: '',
})
export class TestComponent {}

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;

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
                    { path: 'waiting', component: TestComponent },
                    { path: 'lobby', component: LobbyPageComponent },
                ]),
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
            { lobbyID: 1, playerName: 'Name1', gameType: GameType.Classic, timer: 60, canJoin: false },
            { lobbyID: 2, playerName: 'Name2', gameType: GameType.Classic, timer: 60, canJoin: true },
            { lobbyID: 3, playerName: 'Name3', gameType: GameType.LOG2990, timer: 90, canJoin: false },
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
});
