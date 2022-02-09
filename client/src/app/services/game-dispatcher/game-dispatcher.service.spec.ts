import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { SocketService } from '@app/services/socket/socket.service';
import { GameDispatcherService } from './game-dispatcher.service';
import SpyObj = jasmine.SpyObj;

describe('GameDispatcherService', () => {
    let service: GameDispatcherService;
    let gameDispatcherSpy: SpyObj<GameDispatcherController>;

    beforeEach(() => {
        gameDispatcherSpy = jasmine.createSpyObj('GameDispatcherController', ['']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule.withRoutes([])],
            providers: [{ provide: GameDispatcherController, useValue: gameDispatcherSpy }, SocketService],
        });
        service = TestBed.inject(GameDispatcherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
