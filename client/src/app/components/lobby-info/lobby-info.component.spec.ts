import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';

import { LobbyInfoComponent } from './lobby-info.component';

@Component({
    template: '',
})
class TestComponent {}

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
                RouterTestingModule.withRoutes([
                    { path: 'waiting-room', component: TestComponent },
                    { path: 'home', component: TestComponent },
                ]),
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
});
