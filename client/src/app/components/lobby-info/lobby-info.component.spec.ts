import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';

import { LobbyInfoComponent } from './lobby-info.component';

describe('LobbyInfoComponent', () => {
    let component: LobbyInfoComponent;
    let fixture: ComponentFixture<LobbyInfoComponent>;

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
                RouterTestingModule,
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

    // it('joinLobby should redirect to waiting page', () => {
    //     const location: Location = TestBed.inject(Location);
    //     component.joinLobby();
    //     fixture.whenStable().then(() => {
    //         expect(location.path()).toBe('/waiting');
    //     });
    //     expect(component).toBeTruthy();
    // });
});
