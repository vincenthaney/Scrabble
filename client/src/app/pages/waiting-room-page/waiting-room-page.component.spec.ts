import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnlinePlayer } from '@app/classes/player';
import { WaitingRoomPageComponent } from './waiting-room-page.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WaitingRoomMessages } from './waiting-room-page.component.const';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [MatProgressSpinnerModule, MatDialogModule, BrowserAnimationsModule, RouterTestingModule.withRoutes([])],
        }).compileComponents();
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('waitingRoomMessage should change to {opponent name} + OpponentFoundMessage when an opponent joins the lobby', async () => {
        const testOpponent = new OnlinePlayer('testName');
        testOpponent.name = 'testName';
        component.setOpponent(testOpponent);
        expect(component.waitingRoomMessage).toEqual(testOpponent.name + WaitingRoomMessages.OpponentFoundMessage);
    });

    it('waitingRoomMessage should change to HostWaitingMessage when an opponent leaves the lobby', async () => {
        const testOpponent = new OnlinePlayer('testName');
        testOpponent.name = 'testName';
        component.setOpponent(testOpponent);
        component.disconnectOpponent(testOpponent.name);
        expect(component.waitingRoomMessage).toEqual(WaitingRoomMessages.HostWaitingMessage);
    });

    it('startButton should be enabled when an opponent joins the lobby', () => {
        const testOpponent = new OnlinePlayer('testName');
        component.setOpponent(testOpponent);
        fixture.detectChanges();
        const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
        expect(startGameButton.disabled).toBeFalsy();
    });

    it('rejectButton should be enabled when an opponent joins the lobby', () => {
        const testOpponent = new OnlinePlayer('testName');
        component.setOpponent(testOpponent);
        fixture.detectChanges();
        const rejectButton = fixture.nativeElement.querySelector('#reject-button');
        expect(rejectButton.disabled).toBeFalsy();
    });

    it('startButton should be disabled when the opponent leaves the lobby', () => {
        const testOpponent = new OnlinePlayer('testName');
        component.setOpponent(testOpponent);
        component.disconnectOpponent(testOpponent.name);
        fixture.detectChanges();
        const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
        expect(startGameButton.disabled).toBeTruthy();
    });

    it('reject button should be disabled when the opponent leaves the lobby', async () => {
        const testOpponent = new OnlinePlayer('testName');
        component.setOpponent(testOpponent);
        component.disconnectOpponent(testOpponent.name);
        fixture.detectChanges();
        const rejectButton = fixture.nativeElement.querySelector('#reject-button');
        expect(rejectButton.disabled).toBeTruthy();
    });
});
