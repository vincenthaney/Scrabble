/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionType } from '@app/classes/actions/action-data';
import { Round } from '@app/classes/round';
import { Timer } from '@app/classes/timer';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { NO_CURRENT_ROUND, NO_START_GAME_TIME } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
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

@Component({
    template: '',
})
class TestComponent {}

const DEFAULT_MAX_ROUND_TIME = 60;
const ONE_MINUTE_TIMER = new Timer(1, 0);

const TIME_INTERVAL = 1000;
const PAST_DATE = new Date(Date.now() - TIME_INTERVAL);
const CURRENT_DATE = new Date(Date.now());
const FUTURE_DATE = new Date(Date.now() + TIME_INTERVAL);

describe('RoundManagerService', () => {
    let service: RoundManagerService;
    let gameplayControllerSpy: SpyObj<GamePlayController>;

    const currentRound: Round = {
        player: DEFAULT_PLAYER,
        startTime: new Date(PAST_DATE),
        limitTime: new Date(CURRENT_DATE),
        completedTime: null,
    };

    beforeEach(() => {
        gameplayControllerSpy = jasmine.createSpyObj('GamePlayController', ['sendAction']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                RouterTestingModule.withRoutes([
                    { path: 'game', component: TestComponent },
                    { path: 'home', component: TestComponent },
                ]),
            ],
            providers: [{ provide: GamePlayController, useValue: gameplayControllerSpy }],
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

        it('resetServiceData should complete timerSource', () => {
            expect(timeSourceSpy).toHaveBeenCalled();
        });
    });

    describe('UpdateRound', () => {
        let startRoundSpy: unknown;

        const updatedRound: Round = {
            player: DEFAULT_PLAYER,
            startTime: new Date(CURRENT_DATE),
            limitTime: new Date(FUTURE_DATE),
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

        it('updateRound should append old current round to the completed rounds array', () => {
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

        expect(() => service.getActivePlayer()).toThrowError(NO_CURRENT_ROUND);
    });

    it('isActivePlayerLocalPlayer should return true if localPlayerId matches activePlayer id', () => {
        service.localPlayerId = DEFAULT_PLAYER.id;
        service.currentRound = currentRound;
        expect(service.isActivePlayerLocalPlayer()).toBeTrue();
    });

    it('getActivePlayer should throw error if there is no current round', () => {
        service.localPlayerId = 'unknown';
        service.currentRound = currentRound;
        expect(service.isActivePlayerLocalPlayer()).toBeFalse();
    });

    it('getStartGameTime should return the first round start time if there is one', () => {
        service.completedRounds = [currentRound];
        expect(service.getStartGameTime()).toEqual(currentRound.startTime);
    });

    it('getStartGameTime should throw error if there is no first round', () => {
        service.completedRounds = [];
        expect(() => service.getStartGameTime()).toThrowError(NO_START_GAME_TIME);
    });

    describe('StartRound', () => {
        let startTimerSpy: unknown;

        beforeEach(() => {
            startTimerSpy = spyOn(service, 'startTimer').and.callFake(() => {
                return;
            });
            service.startRound(DEFAULT_MAX_ROUND_TIME);
        });

        it('startRound should set new timeout', () => {
            expect(service.timeout).toBeTruthy();
        });

        it('startRound should call startTimer', () => {
            expect(startTimerSpy).toHaveBeenCalled();
        });
    });

    it('startTimer should send new timer with right values', () => {
        const timerSourceSpy = spyOn(service['timerSource'], 'next').and.callFake(() => {
            return;
        });
        service.maxRoundTime = DEFAULT_MAX_ROUND_TIME;
        const newTimer = ONE_MINUTE_TIMER;

        service.currentRound = currentRound;
        const activePlayer = currentRound.player;

        service.startTimer(DEFAULT_MAX_ROUND_TIME);
        expect(timerSourceSpy).toHaveBeenCalledOnceWith([newTimer, activePlayer]);
    });

    describe('RoundTimeout', () => {
        let endRoundEventSpy: unknown;

        beforeEach(() => {
            endRoundEventSpy = spyOn(service.endRoundEvent, 'emit').and.callFake(() => {
                return;
            });
            spyOn(service, 'getActivePlayer').and.returnValue(DEFAULT_PLAYER);
            gameplayControllerSpy.sendAction.and.callFake(() => {
                return;
            });
        });

        it('RoundTimeout should not timeout if user is not on /game', fakeAsync(() => {
            const router: Router = TestBed.inject(Router);
            router.navigateByUrl('/home');
            tick();

            service.roundTimeout();
            expect(endRoundEventSpy).not.toHaveBeenCalled();
        }));

        it('RoundTimeout should not send pass event if the local player is not the active player', () => {
            spyOn(service, 'isActivePlayerLocalPlayer').and.returnValue(false);
            service.roundTimeout();
            expect(gameplayControllerSpy.sendAction).not.toHaveBeenCalled();
        });

        it('RoundTimeout should emit endRoundEvent', fakeAsync(() => {
            const router: Router = TestBed.inject(Router);
            router.navigateByUrl('/game');
            tick();

            spyOn(service, 'isActivePlayerLocalPlayer').and.returnValue(true);

            service.roundTimeout();
            expect(endRoundEventSpy).toHaveBeenCalled();
        }));

        it('RoundTimeout should send pass action when local player is active player', fakeAsync(() => {
            const router: Router = TestBed.inject(Router);
            router.navigateByUrl('/game');
            tick();

            spyOn(service, 'isActivePlayerLocalPlayer').and.returnValue(true);

            const actionPass = {
                type: ActionType.PASS,
                payload: {},
            };

            service.roundTimeout();
            expect(gameplayControllerSpy.sendAction).toHaveBeenCalledWith(service.gameId, DEFAULT_PLAYER.id, actionPass, '');
        }));
    });
});
