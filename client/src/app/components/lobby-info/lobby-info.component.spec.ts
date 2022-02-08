import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameType } from '@app/classes/game-type';
import { AppMaterialModule } from '@app/modules/material.module';

import { LobbyInfoComponent } from './lobby-info.component';

@Component({
    template: '',
})
export class TestComponent {}

const TEST_LOBBY = {
    lobbyId: 'lobbyId',
    playerName: 'playerName',
    gameType: GameType.Classic,
    maxRoundTime: 1,
    dictionary: '',
    canJoin: false,
};

describe('LobbyInfoComponent', () => {
    let component: LobbyInfoComponent;
    let fixture: ComponentFixture<LobbyInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatIconModule,
                MatButtonModule,
                MatTooltipModule,
                ReactiveFormsModule,
                CommonModule,
                MatInputModule,
                BrowserAnimationsModule,
                AppMaterialModule,
                MatFormFieldModule,
                FormsModule,
                RouterTestingModule.withRoutes([{ path: 'waiting', component: TestComponent }]),
            ],
            declarations: [LobbyInfoComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach(() => {
        component.lobby = TEST_LOBBY;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('clicking the join button should emit the lobbyId', async () => {
        const spyEmit = spyOn(component.joinLobbyId, 'emit').and.callFake(() => {
            return '';
        });
        component.lobby.canJoin = true;
        fixture.detectChanges();
        const joinButton = fixture.debugElement.nativeElement.querySelector('#join-button');
        joinButton.click();
        expect(spyEmit).toHaveBeenCalled();
    });

    it('convertTime should output the correct string using the timer in Lobby', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const TIME = 90;
        const EXPECTED_STRING = '1 minute et 30 secondes';
        component.lobby.maxRoundTime = TIME;
        expect(component.convertTime()).toEqual(EXPECTED_STRING);
    });

    it('the tooltip should be disabled if you can join the lobby', async () => {
        component.lobby.canJoin = true;
        fixture.detectChanges();
        const buttonContainer = fixture.debugElement.queryAll(By.css('.button-container'));
        const errorTooltip = buttonContainer[0].injector.get<MatTooltip>(MatTooltip);
        expect(errorTooltip.disabled).toBeTruthy();
    });

    it('the tooltip should be enabled if you cannot join the lobby', async () => {
        component.lobby.canJoin = false;
        fixture.detectChanges();
        const buttonContainer = fixture.debugElement.queryAll(By.css('.button-container'));
        const errorTooltip = buttonContainer[0].injector.get<MatTooltip>(MatTooltip);
        expect(errorTooltip.disabled).toBeFalse();
    });

    it('the tooltip should show the correct message if you cannot join the lobby', async () => {
        fixture.detectChanges();
        const buttonContainer = fixture.debugElement.queryAll(By.css('.button-container'));
        const errorTooltip = buttonContainer[0].injector.get<MatTooltip>(MatTooltip);
        expect(errorTooltip.message).toEqual(`Veuillez entrer un nom valide différent de ${component.lobby.playerName}`);
    });
});
