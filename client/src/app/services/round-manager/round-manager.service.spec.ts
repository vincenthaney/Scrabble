/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionType } from '@app/classes/actions/action-data';
import { PlayerData } from '@app/classes/communication';
import { RoundData } from '@app/classes/communication/round-data';
import { Round } from '@app/classes/round';
import { Tile } from '@app/classes/tile';
import { Timer } from '@app/classes/timer';
import { DEFAULT_PLAYER } from '@app/constants/game';
import { INVALID_ROUND_DATA_PLAYER, NO_CURRENT_ROUND, NO_START_GAME_TIME } from '@app/constants/services-errors';
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
const DEFAULT_PLAYER_NAME = 'name';
const DEFAULT_PLAYER_ID = 'id';
const DEFAULT_PLAYER_SCORE = 420;
const DEFAULT_PLAYER_TILES: Tile[] = [];

const TIME_INTERVAL = 1000;
const PAST_DATE = new Date(Date.now() - TIME_INTERVAL);
const CURRENT_DATE = new Date(Date.now());
const FUTURE_DATE = new Date(Date.now() + TIME_INTERVAL);

const DEFAULT_PLAYER_DATA: PlayerData = { name: 'name', id: 'id', score: 1, tiles: [{ letter: 'A', value: 1 }] };

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

    it('initialize should define attributes', () => {
        service.initialize();
        expect(service.completedRounds).toBeTruthy();
        expect(service['timerSource']).toBeTruthy();
        expect(service.timer).toBeTruthy();
        expect(service.endRoundEvent).toBeTruthy();
    });

    describe('convertRoundDataToRound', () => {
        it('should throw error if roundData.playerData.id is undefined', () => {
            const roundData = {
                playerData: {
                    name: DEFAULT_PLAYER_NAME,
                    score: DEFAULT_PLAYER_SCORE,
                    tiles: DEFAULT_PLAYER_TILES,
                },
                startTime: CURRENT_DATE,
                limitTime: CURRENT_DATE,
                completedTime: null,
            };
            expect(() => service.convertRoundDataToRound(roundData)).toThrowError(INVALID_ROUND_DATA_PLAYER);
        });

        it('should throw error if roundData.playerData.name is undefined', () => {
            const roundData = {
                playerData: {
                    id: DEFAULT_PLAYER_ID,
                    score: DEFAULT_PLAYER_SCORE,
                    tiles: DEFAULT_PLAYER_TILES,
                },
                startTime: CURRENT_DATE,
                limitTime: CURRENT_DATE,
                completedTime: null,
            };
            expect(() => service.convertRoundDataToRound(roundData)).toThrowError(INVALID_ROUND_DATA_PLAYER);
        });

        it('should throw error if roundData.playerData.tiles is undefined', () => {
            const roundData = {
                playerData: {
                    name: DEFAULT_PLAYER_NAME,
                    id: DEFAULT_PLAYER_ID,
                    score: DEFAULT_PLAYER_SCORE,
                },
                startTime: CURRENT_DATE,
                limitTime: CURRENT_DATE,
                completedTime: null,
            };
            expect(() => service.convertRoundDataToRound(roundData)).toThrowError(INVALID_ROUND_DATA_PLAYER);
        });

        it('should throw error if roundData.playerData.id is undefined', () => {
            const roundData = {
                playerData: {
                    name: DEFAULT_PLAYER_NAME,
                    id: DEFAULT_PLAYER_ID,
                    score: DEFAULT_PLAYER_SCORE,
                    tiles: DEFAULT_PLAYER_TILES,
                },
                startTime: CURRENT_DATE,
                limitTime: CURRENT_DATE,
                completedTime: null,
            };
            expect(() => service.convertRoundDataToRound(roundData)).not.toThrow();
        });
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

    it('resetRoundData should reset round data attributes', () => {
        service.resetRoundData();
        expect(service.currentRound).toBeFalsy();
        expect(service.completedRounds).toEqual([]);
        expect(service.maxRoundTime).toEqual(0);
    });

    it('resetTimerData should call clearTimeout and timerSource.complete', () => {
        const clearTimeoutSpy = spyOn(window, 'clearTimeout').and.callFake(() => {
            return;
        });
        const completeSpy = spyOn(service['timerSource'], 'complete').and.callFake(() => {
            return;
        });
        service.resetTimerData();
        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(completeSpy).toHaveBeenCalled();
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

        it('startRound should set the old current round completed time to new round start time', () => {
            const numberOfRounds = service.completedRounds.length;
            expect(service.completedRounds[numberOfRounds - 1].completedTime).toEqual(updatedRound.startTime);
        });

        it('startRound should append old current round to the completed rounds array', () => {
            const numberOfRounds = service.completedRounds.length;
            const lastRoundInArray = service.completedRounds[numberOfRounds - 1];
            currentRound.completedTime = updatedRound.startTime;

            expect(lastRoundInArray).toEqual(currentRound);
        });

        it('startRound should set the new current round to the updatedRound', () => {
            expect(service.currentRound).toEqual(updatedRound);
        });

        it('startRound should call startRound', () => {
            expect(startRoundSpy).toHaveBeenCalled();
        });
    });

    describe('continueRound', () => {
        let startRoundSpy: unknown;
        let timeLeftSpy: unknown;

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

            timeLeftSpy = spyOn(service, 'timeLeft').and.callThrough();
            currentRound.completedTime = null;
            service.currentRound = currentRound;
        });

        it('continueRound should overwrite old current round ', () => {
            const numberOfRoundsBefore = service.completedRounds.length;
            const roundBefore = service.currentRound;
            service.continueRound(updatedRound);
            const numberOfRoundsAfter = service.completedRounds.length;
            expect(numberOfRoundsBefore).toEqual(numberOfRoundsAfter);
            expect(roundBefore).not.toEqual(service.currentRound);
        });

        it('continueRound should call timeLeft with new current round to the updatedRound', () => {
            service.continueRound(updatedRound);

            expect(timeLeftSpy).toHaveBeenCalled();
        });

        it('continueRound should emit endRoundEvent', () => {
            const spy = spyOn(service.endRoundEvent, 'emit').and.callFake(() => {
                return;
            });
            service.continueRound(updatedRound);
            expect(spy).toHaveBeenCalled();
        });

        it('continueRound should call startRound', () => {
            service.continueRound(updatedRound);
            expect(startRoundSpy).toHaveBeenCalled();
        });
    });

    describe('convertRoundDataToRound', () => {
        let roundData: RoundData;

        beforeEach(() => {
            roundData = {
                playerData: { ...DEFAULT_PLAYER_DATA },
                startTime: new Date(CURRENT_DATE),
                limitTime: new Date(FUTURE_DATE),
                completedTime: null,
            };
        });

        it('should not throw an error if roundData has all the information', () => {
            const result = () => service.convertRoundDataToRound(roundData);
            expect(result).not.toThrowError();
        });

        it('should throw an error if roundData is missing information', () => {
            roundData.playerData.id = undefined;
            let result = () => service.convertRoundDataToRound(roundData);
            expect(result).toThrowError(INVALID_ROUND_DATA_PLAYER);
            roundData.playerData.id = DEFAULT_PLAYER_DATA.id;

            roundData.playerData.name = undefined;
            result = () => service.convertRoundDataToRound(roundData);
            expect(result).toThrowError(INVALID_ROUND_DATA_PLAYER);
            roundData.playerData.name = DEFAULT_PLAYER_DATA.name;

            roundData.playerData.tiles = undefined;
            result = () => service.convertRoundDataToRound(roundData);
            expect(result).toThrowError(INVALID_ROUND_DATA_PLAYER);
        });
    });

    describe('getActivePlayer', () => {
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
    });

    describe('isActivePlayerLocalPlayer', () => {
        it('isActivePlayerLocalPlayer should return true if localPlayerId matches activePlayer id', () => {
            service.localPlayerId = DEFAULT_PLAYER.id;
            service.currentRound = currentRound;
            expect(service.isActivePlayerLocalPlayer()).toBeTrue();
        });

        it('isActivePlayerLocalPlayer should throw error if there is no current round', () => {
            service.localPlayerId = 'unknown';
            service.currentRound = currentRound;
            expect(service.isActivePlayerLocalPlayer()).toBeFalse();
        });
    });

    describe('getStartGameTime', () => {
        it('getStartGameTime should return the first round start time if there is one', () => {
            service.completedRounds = [currentRound];
            expect(service.getStartGameTime()).toEqual(currentRound.startTime);
        });

        describe('getActivePlayer', () => {
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
        });

        describe('isActivePlayerLocalPlayer', () => {
            it('isActivePlayerLocalPlayer should return true if localPlayerId matches activePlayer id', () => {
                service.localPlayerId = DEFAULT_PLAYER.id;
                service.currentRound = currentRound;
                expect(service.isActivePlayerLocalPlayer()).toBeTrue();
            });

            it('isActivePlayerLocalPlayer should throw error if there is no current round', () => {
                service.localPlayerId = 'unknown';
                service.currentRound = currentRound;
                expect(service.isActivePlayerLocalPlayer()).toBeFalse();
            });
        });

        describe('getStartGameTime', () => {
            it('getStartGameTime should return the first round start time if there is one', () => {
                service.completedRounds = [currentRound];
                expect(service.getStartGameTime()).toEqual(currentRound.startTime);
            });

            it('getStartGameTime should throw error if there is no first round', () => {
                service.completedRounds = [];
                expect(() => service.getStartGameTime()).toThrowError(NO_START_GAME_TIME);
            });
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
                    input: '',
                    payload: {},
                };

                service.roundTimeout();
                expect(gameplayControllerSpy.sendAction).toHaveBeenCalledWith(service.gameId, DEFAULT_PLAYER.id, actionPass);
            }));
        });
    });
});
