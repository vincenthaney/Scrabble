import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnlinePlayer } from '@app/classes/player';
import { CreateWaitingPageComponent } from './create-waiting-page.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WaitingRoomMessages } from './create-waiting-page.component.const';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateWaitingPageComponent', () => {
    let component: CreateWaitingPageComponent;
    let fixture: ComponentFixture<CreateWaitingPageComponent>;
    const testOpponent = new OnlinePlayer('testName');
    testOpponent.name = 'testName';

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateWaitingPageComponent],
            imports: [MatProgressSpinnerModule, MatDialogModule, BrowserAnimationsModule, RouterTestingModule.withRoutes([])],
        }).compileComponents();
        fixture = TestBed.createComponent(CreateWaitingPageComponent);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateWaitingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.setOpponent(testOpponent);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('waitingRoomMessage should change to {opponent name} + OpponentFoundMessage when an opponent joins the lobby', async () => {
        expect(component.waitingRoomMessage).toEqual(testOpponent.name + WaitingRoomMessages.OpponentFoundMessage);
    });

    it('waitingRoomMessage should change to HostWaitingMessage when an opponent leaves the lobby', async () => {
        component.disconnectOpponent(testOpponent.name);
        expect(component.waitingRoomMessage).toEqual(WaitingRoomMessages.HostWaitingMessage);
    });

    it('startButton should be enabled when an opponent joins the lobby', () => {
        fixture.detectChanges();
        const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
        expect(startGameButton.disabled).toBeFalsy();
    });

    it('rejectButton should be enabled when an opponent joins the lobby', () => {
        fixture.detectChanges();
        const rejectButton = fixture.nativeElement.querySelector('#reject-button');
        expect(rejectButton.disabled).toBeFalsy();
    });

    it('startButton should be disabled when the opponent leaves the lobby', () => {
        component.disconnectOpponent(testOpponent.name);
        fixture.detectChanges();
        const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
        expect(startGameButton.disabled).toBeTruthy();
    });

    it('reject button should be disabled when the opponent leaves the lobby', async () => {
        component.disconnectOpponent(testOpponent.name);
        fixture.detectChanges();
        const rejectButton = fixture.nativeElement.querySelector('#reject-button');
        expect(rejectButton.disabled).toBeTruthy();
    });
});
