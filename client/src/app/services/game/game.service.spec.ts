import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { BoardService, GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import SpyObj = jasmine.SpyObj;

describe('GameService', () => {
    let service: GameService;
    let routerSpy: SpyObj<Router>;
    let boardServiceSpy: SpyObj<BoardService>;
    let roundManagerSpy: SpyObj<RoundManagerService>;
    let gameDispatcherControllerSpy: SpyObj<GameDispatcherController>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['']);
        boardServiceSpy = jasmine.createSpyObj('BoardService', ['']);
        roundManagerSpy = jasmine.createSpyObj('RoundManagerService', ['']);
        gameDispatcherControllerSpy = jasmine.createSpyObj('GameDispatcherController', ['']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterModule],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: BoardService, useValue: boardServiceSpy },
                { provide: RoundManagerService, useValue: roundManagerSpy },
                { provide: GameDispatcherController, useValue: gameDispatcherControllerSpy },
            ],
        });
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
