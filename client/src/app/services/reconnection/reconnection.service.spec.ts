import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { ReconnectionService } from './reconnection.service';
import SpyObj = jasmine.SpyObj;

describe('ReconnectionService', () => {
    let service: ReconnectionService;
    let gameDispatcherSpy: SpyObj<GameDispatcherController>;

    beforeEach(() => {
        gameDispatcherSpy = jasmine.createSpyObj('GameDispatcherController', ['configureSocket']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule],
            providers: [{ provide: GameDispatcherController, useValue: gameDispatcherSpy }],
        });
        service = TestBed.inject(ReconnectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('initializeControllerSockets should call configureSockets on GameDispatcherController', () => {
        gameDispatcherSpy.configureSocket.and.callFake(() => {
            return;
        });
        service.initializeControllerSockets();
        expect(gameDispatcherSpy.configureSocket).toHaveBeenCalled();
    });
});
