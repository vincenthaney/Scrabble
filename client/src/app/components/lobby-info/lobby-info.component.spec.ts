import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AppMaterialModule } from '@app/modules/material.module';

import { LobbyInfoComponent } from './lobby-info.component';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const fakeNavigate = () => {};

describe('LobbyInfoComponent', () => {
    let component: LobbyInfoComponent;
    let fixture: ComponentFixture<LobbyInfoComponent>;
    const routerSpy = {
        navigateByUrl: jasmine.createSpy('navigateByUrl').and.callFake(fakeNavigate),
    };
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
            ],
            providers: [
                {
                    provide: Router,
                    useValue: routerSpy,
                },
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

    it('joinLobby should redirect to waiting page', () => {
        component.joinLobby();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('waiting');
    });

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const TIMES = [0, 30, 60, 90];
    const EXPECTED_STRINGS = ['', '30 secondes', '1 minute', '1 minute et 30 secondes'];
    for (let i = 0; i < TIMES.length; i++) {
        it(`convertTime should output the correct string using the timer in Lobby (${TIMES[i]})`, () => {
            component.lobby.timer = TIMES[i];
            expect(component.convertTime()).toEqual(EXPECTED_STRINGS[i]);
        });
    }
});
