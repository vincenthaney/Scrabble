import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LobbyPageComponent } from './lobby-page.component';
import { FormControl, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldControl, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { LobbyInfoComponent } from '@app/components/lobby-info/lobby-info.component';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormControl,
                Validators,
                MatInputModule,
                MatFormFieldControl,
                MatFormFieldModule,
                MatDividerModule,
                LobbyInfoComponent,
                MatLabel,
            ],

            declarations: [LobbyPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
