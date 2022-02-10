import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { OnlinePlayer } from '@app/classes/player';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { SocketService } from '@app/services/socket/socket.service';
import { JoinWaitingPageComponent } from './join-waiting-page.component';

@Component({
    template: '',
})
export class TestComponent {}

describe('JoinWaitingPageComponent', () => {
    let component: JoinWaitingPageComponent;
    let fixture: ComponentFixture<JoinWaitingPageComponent>;
    const testOpponent = new OnlinePlayer('testName');

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinWaitingPageComponent],
            imports: [
                MatProgressBarModule,
                MatDialogModule,
                BrowserAnimationsModule,
                RouterTestingModule.withRoutes([{ path: 'lobby', component: TestComponent }]),
                HttpClientTestingModule,
            ],
            providers: [GameDispatcherService, SocketService],
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

    it('should open the cancel dialog when host cancels the game', () => {
        const spy = spyOn(component.dialog, 'open');
        component.hostHasCanceled(testOpponent.name);
        expect(spy).toHaveBeenCalled();
    });

    it('cancelButton should send to GameDispatcher service that the joining player has left', async () => {
        const gameDispatcherSpy = jasmine.createSpyObj('GameDispatcherService', ['handleLeaveLobby']);
        const cancelButton = fixture.debugElement.nativeElement.querySelector('#cancel-button');
        cancelButton.click();
        expect(gameDispatcherSpy.handleLeaveLobby).toHaveBeenCalled();
    });
});
