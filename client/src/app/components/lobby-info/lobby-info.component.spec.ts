import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { LobbyInfoComponent } from './lobby-info.component';

describe('LobbyInfoComponent', () => {
    let component: LobbyInfoComponent;
    let fixture: ComponentFixture<LobbyInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatIconRegistry, DomSanitizer, MatIconModule, MatButtonModule],
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
});
