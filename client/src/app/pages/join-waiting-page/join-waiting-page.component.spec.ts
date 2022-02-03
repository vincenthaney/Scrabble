import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinWaitingPageComponent } from './join-waiting-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { OnlinePlayer } from '@app/classes/player';

describe('WaitingPageComponent', () => {
    let component: JoinWaitingPageComponent;
    let fixture: ComponentFixture<JoinWaitingPageComponent>;
    const testOpponent = new OnlinePlayer('testName');

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

    it('should open the rejected dialog when player is rejected', () => {
        const spy = spyOn(component.dialog, 'open');
        component.playerHasBeenRejected(testOpponent);
        expect(spy).toHaveBeenCalled();
    });
});
