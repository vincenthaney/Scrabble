import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinWaitingPageComponent } from './join-waiting-page.component';
import { Location } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

describe('WaitingPageComponent', () => {
    let component: JoinWaitingPageComponent;
    let fixture: ComponentFixture<JoinWaitingPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinWaitingPageComponent],
            imports: [MatDialogModule, BrowserAnimationsModule, RouterTestingModule.withRoutes([])],
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

    it('createGame button should reroute to waiting-room page if form is valid', async () => {
        const location: Location = TestBed.inject(Location);

        const cancelButton = fixture.debugElement.nativeElement.querySelector('#cancel');
        cancelButton.click();

        return fixture.whenStable().then(() => {
            expect(location.path()).toBe('/lobby');
        });
    });
});
