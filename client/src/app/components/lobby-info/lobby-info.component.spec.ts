import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';

import { LobbyInfoComponent } from './lobby-info.component';

// eslint-disable-next-line @typescript-eslint/no-empty-function
// const fakeNavigate = () => {};

@Component({
    template: '',
})
export class TestComponent {}

describe('LobbyInfoComponent', () => {
    let component: LobbyInfoComponent;
    let fixture: ComponentFixture<LobbyInfoComponent>;
    // const routerSpy = {
    //     navigateByUrl: jasmine.createSpy('navigateByUrl').and.callFake(fakeNavigate),
    // };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatIconModule,
                MatButtonModule,
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('joinLobby should redirect to waiting page', async () => {
        component.joinLobby();
        const location: Location = TestBed.inject(Location);
        return fixture.whenStable().then(() => {
            expect(location.path()).toBe('/waiting');
        });
    });

    it('convertTime should output the correct string using the timer in Lobby', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const TIME = 90;
        const EXPECTED_STRING = '1 minute et 30 secondes';
        component.lobby.timer = TIME;
        expect(component.convertTime()).toEqual(EXPECTED_STRING);
    });
});
