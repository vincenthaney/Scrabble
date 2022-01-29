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

describe('LobbyInfoComponent', () => {
    let component: LobbyInfoComponent;
    let fixture: ComponentFixture<LobbyInfoComponent>;
    const routerSpy = {
        navigateByUrl: jasmine.createSpy('navigateByUrl'),
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

    it('convertTime should output the correct string', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const TIMES = [0, 1, 2, 30, 60, 61, 90, 120, 121, 150, 243];
        const EXPECTED_STRINGS = [
            '',
            '1 seconde',
            '2 secondes',
            '30 secondes',
            '1 minute',
            '1 minute et 1 seconde',
            '1 minute et 30 secondes',
            '2 minutes',
            '2 minutes et 1 seconde',
            '2 minutes et 30 secondes',
            '4 minutes et 3 secondes',
        ];
        for (let i = 0; i < TIMES.length; i++) {
            component.lobby.timer = TIMES[i];
            expect(component.convertTime()).toEqual(EXPECTED_STRINGS[i]);
        }
    });
});
