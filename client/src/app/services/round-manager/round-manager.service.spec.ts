/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Round } from '@app/classes/round';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import * as ROUND_ERROR from './round-manager.service.errors';
import SpyObj = jasmine.SpyObj;

class RoundManagerServiceWrapper {
    roundManagerService: RoundManagerService;
    pCurrentRound: Round;
    constructor(roundManagerService: RoundManagerService) {
        this.roundManagerService = roundManagerService;
        this.currentRound = roundManagerService.currentRound;
    }

    get currentRound(): Round {
        return this.pCurrentRound;
    }

    set currentRound(round: Round) {
        this.pCurrentRound = round;
    }
}

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

    describe('UpdateRound', () => {
        let startRoundSpy: unknown;

        const updatedRound: Round = {
            player: DEFAULT_PLAYER,
            startTime: new Date(Date.now()),
            limitTime: new Date(Date.now() + 1000),
            completedTime: null,
        };

        beforeEach(() => {
            startRoundSpy = spyOn(service, 'startRound').and.callFake(() => {
                return;
            });
            currentRound.completedTime = null;
            service.currentRound = currentRound;
            service.updateRound(updatedRound);
        });

        it('updateRound should set the old current round completed time to new round start time', () => {
            const numberOfRounds = service.completedRounds.length;
            expect(service.completedRounds[numberOfRounds - 1].completedTime).toEqual(updatedRound.startTime);
        });

        it('updateRound should set old current round to the end of completed rounds', () => {
            const numberOfRounds = service.completedRounds.length;
            const lastRoundInArray = service.completedRounds[numberOfRounds - 1];
            currentRound.completedTime = updatedRound.startTime;

            expect(lastRoundInArray).toEqual(currentRound);
        });

        it('updateRound should set the new current round to the updatedRound', () => {
            expect(service.currentRound).toEqual(updatedRound);
        });

        it('updateRound should call startRound', () => {
            expect(startRoundSpy).toHaveBeenCalled();
        });
    });

    it('getActivePlayer should return the player of the current round', () => {
        service.currentRound = currentRound;
        expect(service.getActivePlayer()).toEqual(currentRound.player);
    });

    it('getActivePlayer should throw error if there is no current round', () => {
        const wrapper = new RoundManagerServiceWrapper(service);
        spyOnProperty(wrapper, 'currentRound', 'get').and.returnValue(null);
        service.currentRound = wrapper.currentRound;

        expect(() => service.getActivePlayer()).toThrowError(ROUND_ERROR.NO_CURRENT_ROUND);
    });
});
