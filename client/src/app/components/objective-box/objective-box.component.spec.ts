/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerData } from '@app/classes/communication';
import { InitializeGameData } from '@app/classes/communication/game-config';
import { ObjectiveData } from '@app/classes/communication/objective-data';
import { RoundData } from '@app/classes/communication/round-data';
import { GameType } from '@app/classes/game-type';
import { ObjectiveState } from '@app/classes/objectives/objective-state';
import { EventTypes } from '@app/services/game-view-event-manager-service/event-types';
import { Observable, Subject, Subscription } from 'rxjs';

import { ObjectiveBoxComponent } from './objective-box.component';

const DEFAULT_OBJECTIVE: ObjectiveData = {
    name: '',
    description: '',
    state: ObjectiveState.NotCompleted,
    progress: 0,
    maxProgress: 0,
    isPublic: false,
    bonusPoints: 0,
};

const DEFAULT_GAME_DATA: InitializeGameData = {
    localPlayerId: '1',
    startGameData: {
        gameId: 'g',
        board: new Array(),
        tileReserve: new Array(),
        round: {} as RoundData,
        player1: {} as PlayerData,
        player2: {} as PlayerData,
        gameType: GameType.Classic,
        maxRoundTime: 0,
        dictionary: '',
    },
};

describe('ObjectiveBoxComponent', () => {
    let component: ObjectiveBoxComponent;
    let fixture: ComponentFixture<ObjectiveBoxComponent>;
    let isLocalPlayerPlayer1Spy: jasmine.Spy;
    let subscribeToGameViewEventSpy: jasmine.Spy<
        <T extends keyof EventTypes, S extends EventTypes[T]>(eventType: T, destroy$: Observable<boolean>, next: (payload: S) => void) => Subscription
    >;
    let player1Objectives: ObjectiveData[];
    let player2Objectives: ObjectiveData[];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            declarations: [ObjectiveBoxComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ObjectiveBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        isLocalPlayerPlayer1Spy = spyOn(component['gameService'], 'isLocalPlayerPlayer1').and.returnValue(true);
        subscribeToGameViewEventSpy = spyOn(component['gameViewEventManagerService'], 'subscribeToGameViewEvent');

        player1Objectives = [
            { ...DEFAULT_OBJECTIVE, name: 'player 1 objective' },
            { ...DEFAULT_OBJECTIVE, isPublic: true },
        ];
        player2Objectives = [
            { ...DEFAULT_OBJECTIVE, name: 'player 2 objective' },
            { ...DEFAULT_OBJECTIVE, isPublic: true },
        ];

        component['objectives'] = { player1Objectives, player2Objectives };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        for (const expected of [true, false]) {
            it(`should set isLocalPlayerPlayer1 from gameService (${expected})`, () => {
                isLocalPlayerPlayer1Spy.and.returnValue(expected);

                component.ngOnInit();

                expect(component['isLocalPlayerPlayer1']).toEqual(expected);
                expect(isLocalPlayerPlayer1Spy).toHaveBeenCalled();
            });
        }

        it('should subscribe to gameInitialized', () => {
            component.ngOnInit();

            expect(subscribeToGameViewEventSpy).toHaveBeenCalledWith('gameInitialized', jasmine.any(Subject), jasmine.any(Function));
        });

        it('should reset objective on gameInitialized', () => {
            subscribeToGameViewEventSpy.and.callThrough();
            component.ngOnInit();

            component['gameViewEventManagerService'].emitGameViewEvent('gameInitialized', { ...DEFAULT_GAME_DATA });

            expect(component['objectives']).toEqual({});
        });

        const tests: [localId: string, player1Id: string, expected: boolean, name: string][] = [
            ['a', 'b', false, 'not player1'],
            ['a', 'a', true, 'player1'],
        ];

        for (const [localId, player1Id, expected, name] of tests) {
            it(`should reset isLocalPlayerPlayer1 on gameInitialized when local player is ${name}`, () => {
                subscribeToGameViewEventSpy.and.callThrough();
                component.ngOnInit();

                const data = { ...DEFAULT_GAME_DATA };
                data.localPlayerId = localId;
                data.startGameData.player1.id = player1Id;

                component['gameViewEventManagerService'].emitGameViewEvent('gameInitialized', data);

                expect(component['isLocalPlayerPlayer1']).toEqual(expected);
            });
        }

        it('should not update when gameData is undefined', () => {
            subscribeToGameViewEventSpy.and.callThrough();
            component.ngOnInit();

            component['gameViewEventManagerService'].emitGameViewEvent('gameInitialized');

            expect(component['objectives']).not.toEqual({});
        });
    });

    describe('ngOnDestroy', () => {
        it('should call next and complete on componentDestroyed', () => {
            const nextSpy = spyOn(component['componentDestroyed$'], 'next');
            const completeSpy = spyOn(component['componentDestroyed$'], 'complete');

            component.ngOnDestroy();

            expect(nextSpy).toHaveBeenCalledWith(true);
            expect(completeSpy).toHaveBeenCalled();
        });
    });

    describe('getPublicObjectives', () => {
        it('should return all objectives that are public', () => {
            const allObjectives = component['getObjectives']();
            const publicObjectives = component.getPublicObjectives();

            expect(allObjectives.some((o) => !o.isPublic)).toBeTrue();
            expect(publicObjectives.every((o) => o.isPublic)).toBeTrue();
        });
    });

    describe('getPrivateObjectives', () => {
        it('should return all objectives that are public', () => {
            const allObjectives = component['getObjectives']();
            const privateObjectives = component.getPrivateObjectives();

            expect(allObjectives.some((o) => o.isPublic)).toBeTrue();
            expect(privateObjectives.every((o) => !o.isPublic)).toBeTrue();
        });
    });

    describe('getObjectives', () => {
        it('should return player1Objectives if is player 1', () => {
            isLocalPlayerPlayer1Spy.and.returnValue(true);

            component.ngOnInit();

            expect(component['getObjectives']()).toEqual(player1Objectives);
        });

        it('should return player1Objectives if is player 2', () => {
            isLocalPlayerPlayer1Spy.and.returnValue(false);

            component.ngOnInit();

            expect(component['getObjectives']()).toEqual(player2Objectives);
        });
    });
});
