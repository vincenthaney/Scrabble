import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { BoardService, GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import SpyObj = jasmine.SpyObj;

@Component({
    template: '',
})
class TestComponent {}

describe('GameService', () => {
    let service: GameService;
    let boardServiceSpy: SpyObj<BoardService>;
    let roundManagerSpy: SpyObj<RoundManagerService>;
    let gameDispatcherControllerSpy: SpyObj<GameDispatcherController>;

    beforeEach(() => {
        boardServiceSpy = jasmine.createSpyObj('BoardService', ['']);
        roundManagerSpy = jasmine.createSpyObj('RoundManagerService', ['']);
        gameDispatcherControllerSpy = jasmine.createSpyObj('GameDispatcherController', ['']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{ path: 'game', component: TestComponent }])],
            providers: [
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
