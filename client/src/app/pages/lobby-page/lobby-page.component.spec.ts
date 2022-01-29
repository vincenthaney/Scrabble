import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LobbyPageComponent } from './lobby-page.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';

describe('LobbyPageComponent', () => {
    let component: LobbyPageComponent;
    let fixture: ComponentFixture<LobbyPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatInputModule, MatFormFieldModule, MatDividerModule],

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
