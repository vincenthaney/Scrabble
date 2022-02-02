import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { JoinWaitingPageComponent } from './join-waiting-page.component';

describe('WaitingPageComponent', () => {
    let component: JoinWaitingPageComponent;
    let fixture: ComponentFixture<JoinWaitingPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinWaitingPageComponent],
            imports: [MatProgressBarModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinWaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
