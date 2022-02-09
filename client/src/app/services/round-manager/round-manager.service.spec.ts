import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import SpyObj = jasmine.SpyObj;

describe('RoundManagerService', () => {
    let service: RoundManagerService;
    let gameDispatcherControllerSpy: SpyObj<GameDispatcherController>;

    beforeEach(() => {
        gameDispatcherControllerSpy = jasmine.createSpyObj('GameDispatcherController', ['']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule.withRoutes([])],
            providers: [{ provide: GameDispatcherController, useValue: gameDispatcherControllerSpy }],
        });
        service = TestBed.inject(RoundManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
