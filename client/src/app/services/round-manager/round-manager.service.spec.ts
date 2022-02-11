import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Round } from '@app/classes/round';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import SpyObj = jasmine.SpyObj;

describe('RoundManagerService', () => {
    let service: RoundManagerService;
    let gameDispatcherControllerSpy: SpyObj<GameDispatcherController>;

    const currentRound: Round = {
        player: DEFAULT_PLAYER,
        startTime: new Date(Date.now() - 1000),
        limitTime: new Date(Date.now()),
        completedTime: null,
    };

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

    describe('ResetServiceData', () => {
        let timeSourceSpy: unknown;

        beforeEach(() => {
            timeSourceSpy = spyOn(service['timerSource'], 'complete').and.callFake(() => {
                return;
            });
            service.resetServiceData();
        });

        it('resetServiceData should reset the gameId', () => {
            expect(service.gameId).toEqual('');
        });

        it('resetServiceData should reset the localPlayerId', () => {
            expect(service.localPlayerId).toEqual('');
        });

        it('resetServiceData should reset the completed rounds', () => {
            expect(service.completedRounds).toEqual([]);
        });

        it('resetServiceData should reset the max round time', () => {
            expect(service.maxRoundTime).toEqual(0);
        });

        it('resetServiceData should clear the timeout', () => {
            // SPY ON clearTimeout
        });

        it('resetServiceData should reset the gameId', () => {
            expect(timeSourceSpy).toHaveBeenCalled();
        });
    });
});
