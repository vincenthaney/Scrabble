import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnlinePlayer } from '@app/classes/player';
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { WaitingRoomPageComponent } from './waiting-room-page.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WaitingRoomMessages } from './waiting-room-page.component.const';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

let loader: HarnessLoader;

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomPageComponent],
            imports: [MatProgressSpinnerModule, MatDialogModule, BrowserAnimationsModule, RouterTestingModule.withRoutes([])],
        }).compileComponents();
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should throw error when opponent connects and message doesn't change", async () => {
        const testOpponent = new OnlinePlayer('testName');
        testOpponent.name = 'testName';
        component.setOpponent(testOpponent);
        expect(component.messageWaitingRoom).toEqual(testOpponent.name + WaitingRoomMessages.OpponentFoundMessage);
    });

    it("should throw error when opponent disconnects and message doesn't change", async () => {
        const testOpponent = new OnlinePlayer('testName');
        testOpponent.name = 'testName';
        component.setOpponent(testOpponent);
        component.disconnectOpponent();
        expect(component.messageWaitingRoom).toEqual(WaitingRoomMessages.HostWaitingMessage);
    });

    it('should throw error when opponent connects and start-button stays disabled', async () => {
        const testOpponent = new OnlinePlayer('testName');
        component.setOpponent(testOpponent);
        const startButton = await loader.getHarness(MatButtonHarness.with({ selector: '#start-game-button' })); // === buttons[0]
        expect(await startButton.isDisabled()).toBe(true);
    });

    it('should throw error when opponent connects and reject-button stays disabled', async () => {
        const testOpponent = new OnlinePlayer('testName');
        component.opponent = testOpponent;
        const rejectButton = await loader.getHarness(MatButtonHarness.with({ selector: '#reject-button' })); // === buttons[0]
        expect(await rejectButton.isDisabled()).toBe(true);
    });

    it('should throw error when opponent disconnects and start-button stays enabled', async () => {
        const testOpponent = new OnlinePlayer('testName');
        component.opponent = testOpponent;
        component.disconnectOpponent();
        const startButton = await loader.getHarness(MatButtonHarness.with({ selector: '#start-game-button' })); // === buttons[0]
        expect(await startButton.isDisabled()).toBe(true);
    });

    it('should throw error when opponent disconnects and reject-button stays enabled', async () => {
        const testOpponent = new OnlinePlayer('testName');
        component.opponent = testOpponent;
        component.disconnectOpponent();
        const rejectButton = await loader.getHarness(MatButtonHarness.with({ selector: '#reject-button' })); // === buttons[0]
        expect(await rejectButton.isDisabled()).toBe(true);
    });
});
