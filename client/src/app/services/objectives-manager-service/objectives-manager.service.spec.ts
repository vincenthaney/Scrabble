/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { StartGameData } from '@app/classes/communication/game-config';
import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
import { ObjectiveData } from '@app/classes/communication/objective-data';
import { ObjectiveState } from '@app/classes/objectives/objective-state';

import { ObjectivesManagerService } from './objectives-manager.service';

const DEFAULT_OBJECTIVE: ObjectiveData = {
    name: '',
    description: '',
    state: ObjectiveState.NotCompleted,
    progress: 0,
    maxProgress: 0,
    isPublic: false,
    bonusPoints: 0,
};

describe('ObjectivesManagerService', () => {
    let service: ObjectivesManagerService;
    let player1Objectives: ObjectiveData[];
    let player2Objectives: ObjectiveData[];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ObjectivesManagerService);

        player1Objectives = [
            { ...DEFAULT_OBJECTIVE, name: 'player 1 objective' },
            { ...DEFAULT_OBJECTIVE, isPublic: true },
        ];
        player2Objectives = [
            { ...DEFAULT_OBJECTIVE, name: 'player 2 objective' },
            { ...DEFAULT_OBJECTIVE, isPublic: true },
        ];

        service['objectives'] = { player1Objectives, player2Objectives };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize', () => {
        it('should set objectives and isLocalPlayerPlayer1', () => {
            const startGameData: StartGameData = {
                player1: {
                    objectives: player1Objectives,
                },
                player2: {
                    objectives: player2Objectives,
                },
            } as unknown as StartGameData;
            const isLocalPlayerPlayer1 = true;

            service.initialize(startGameData, isLocalPlayerPlayer1);

            expect(service['objectives']?.player1Objectives).toEqual(player1Objectives);
            expect(service['objectives']?.player2Objectives).toEqual(player2Objectives);
            expect(service['isLocalPlayerPlayer1']).toEqual(isLocalPlayerPlayer1);
        });
    });

    describe('getPublicObjectives', () => {
        it('should return all objectives that are public', () => {
            const allObjectives = service['getObjectives']();
            const publicObjectives = service.getPublicObjectives();

            expect(allObjectives.some((o) => !o.isPublic)).toBeTrue();
            expect(publicObjectives.every((o) => o.isPublic)).toBeTrue();
        });
    });

    describe('updateObjectives', () => {
        it('should set objectives', () => {
            const objectives: GameObjectivesData = {};

            service.updateObjectives(objectives);

            expect(service['objectives']).toEqual(objectives);
        });
    });

    describe('resetServiceData', () => {
        it('should set objectives to undefined', () => {
            service.resetServiceData();

            expect(service['objectives']).toBeUndefined();
        });
    });

    describe('getPrivateObjectives', () => {
        it('should return all objectives that are public', () => {
            const allObjectives = service['getObjectives']();
            const privateObjectives = service.getPrivateObjectives();

            expect(allObjectives.some((o) => o.isPublic)).toBeTrue();
            expect(privateObjectives.every((o) => !o.isPublic)).toBeTrue();
        });
    });

    describe('getObjectives', () => {
        it('should return player1Objectives if is player 1', () => {
            service['isLocalPlayerPlayer1'] = true;

            expect(service['getObjectives']()).toEqual(player1Objectives);
        });

        it('should return player1Objectives if is player 2', () => {
            service['isLocalPlayerPlayer1'] = false;

            expect(service['getObjectives']()).toEqual(player2Objectives);
        });

        it('should return empty array if objectives are undefined (player 1)', () => {
            service['isLocalPlayerPlayer1'] = true;
            service['objectives'] = undefined;

            expect(service['getObjectives']()).toEqual([]);
        });

        it('should return empty array if objectives are undefined (player 2)', () => {
            service['isLocalPlayerPlayer1'] = false;
            service['objectives'] = undefined;

            expect(service['getObjectives']()).toEqual([]);
        });

        it('should return empty array if player1 objectives are undefined', () => {
            service['isLocalPlayerPlayer1'] = true;
            service['objectives'] = {};

            expect(service['getObjectives']()).toEqual([]);
        });

        it('should return empty array if player2 objectives are undefined', () => {
            service['isLocalPlayerPlayer1'] = false;
            service['objectives'] = {};

            expect(service['getObjectives']()).toEqual([]);
        });
    });
});
