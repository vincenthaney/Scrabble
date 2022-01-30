import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnlinePlayer } from '@app/classes/player';
import { CreateWaitingPageComponent } from './create-waiting-page.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HOST_WAITING_MESSAGE, OPPONENT_FOUND_MESSAGE } from './create-waiting-page.component.const';
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
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('waitingRoomMessage should change to {opponent name} + OpponentFoundMessage when an opponent joins the lobby', async () => {
        component.setOpponent(testOpponent);
        expect(component.waitingRoomMessage).toEqual(testOpponent.name + OPPONENT_FOUND_MESSAGE);
    });

    it('waitingRoomMessage should change to HostWaitingMessage when an opponent leaves the lobby', async () => {
        component.setOpponent(testOpponent);
        component.disconnectOpponent(testOpponent.name);
        expect(component.waitingRoomMessage).toEqual(HOST_WAITING_MESSAGE);
    });

    it('startButton should be enabled when an opponent joins the lobby', () => {
        component.setOpponent(testOpponent);
        fixture.detectChanges();
        const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
        expect(startGameButton.disabled).toBeFalsy();
    });

    it('rejectButton should be enabled when an opponent joins the lobby', () => {
        component.setOpponent(testOpponent);
        fixture.detectChanges();
        const rejectButton = fixture.nativeElement.querySelector('#reject-button');
        expect(rejectButton.disabled).toBeFalsy();
    });

    it('startButton should be disabled when the opponent leaves the lobby', () => {
        component.setOpponent(testOpponent);
        component.disconnectOpponent(testOpponent.name);
        fixture.detectChanges();
        const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
        expect(startGameButton.disabled).toBeTruthy();
    });

    it('reject button should be disabled when the opponent leaves the lobby', async () => {
        component.setOpponent(testOpponent);
        component.disconnectOpponent(testOpponent.name);
        fixture.detectChanges();
        const rejectButton = fixture.nativeElement.querySelector('#reject-button');
        expect(rejectButton.disabled).toBeTruthy();
    });

    it('startButton should be disabled when the game is created and no opponent has joined it.', () => {
        const startGameButton = fixture.nativeElement.querySelector('#start-game-button');
        expect(startGameButton.disabled).toBeTruthy();
    });

    it('rejectButton should be disabled when the game is created and no opponent has joined it.', () => {
        const rejectButton = fixture.nativeElement.querySelector('#reject-button');
        expect(rejectButton.disabled).toBeTruthy();
    });

    it('convertSolo should be enabled when the game is created and no opponent has joined it.', () => {
        const convertSoloButton = fixture.nativeElement.querySelector('#convert-solo-button');
        expect(convertSoloButton.disabled).toBeFalsy();
    });

    it('cancelButton should be enabled when the game is created and no opponent has joined it.', () => {
        const cancelButtonButton = fixture.nativeElement.querySelector('#cancel-button');
        expect(cancelButtonButton.disabled).toBeFalsy();
    });
});
