import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Player } from '@app/classes/player';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { SocketService } from '@app/services/socket/socket.service';
import { JoinWaitingPageComponent } from './join-waiting-page.component';
import SpyObj = jasmine.SpyObj;

@Component({
    template: '',
})
export class TestComponent {}

describe('JoinWaitingPage', () => {
    let component: JoinWaitingPageComponent;
    let fixture: ComponentFixture<JoinWaitingPageComponent>;
    let gameDispatcherSpy: SpyObj<GameDispatcherService>;
    const testOpponent = new Player('', 'testName', []);

    beforeEach(() => {
        gameDispatcherSpy = jasmine.createSpyObj('GameDispatcherService', ['handleLeaveLobby']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinWaitingPageComponent],
            imports: [
                MatProgressBarModule,
                MatDialogModule,
                BrowserAnimationsModule,
                RouterTestingModule.withRoutes([{ path: 'lobby', component: TestComponent }]),
                HttpClientModule,
            ],
            providers: [{ provide: GameDispatcherService, useValue: gameDispatcherSpy }, SocketService],
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
        gameDispatcherSpy.handleLeaveLobby.and.callFake(() => {
            return;
        });
        const cancelButton = fixture.debugElement.nativeElement.querySelector('#cancel-button');
        cancelButton.click();
        expect(gameDispatcherSpy.handleLeaveLobby).toHaveBeenCalled();
    });
});
