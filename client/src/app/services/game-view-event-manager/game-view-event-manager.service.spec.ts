/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/orientation';
import * as SERVICE_ERRORS from '@app/constants/services-errors';
import { Observable, Subject, Subscription } from 'rxjs';
import { EventTypes } from './event-types';
import { GameViewEventManagerService } from './game-view-event-manager.service';

describe('GameViewEventManagerService', () => {
    let service: GameViewEventManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameViewEventManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('emitGameViewEvent', () => {
        let eventMapSpy: unknown;
        let subjectMock: Subject<any>;
        let subjectSpy: unknown;

        beforeEach(() => {
            subjectMock = new Subject();
            eventMapSpy = spyOn<any>(service, 'getSubjectFromMap').and.callFake(() => {
                return subjectMock;
            });
            subjectSpy = spyOn(subjectMock, 'next').and.callFake(() => {
                return;
            });
        });

        it('should call getSubjectFromMap', () => {
            const event = 'tileRackUpdate';
            service.emitGameViewEvent(event);
            expect(eventMapSpy).toHaveBeenCalledWith(event);
        });

        it('should call next with payload', () => {
            const event = 'tilesPlayed';
            const payload: ActionPlacePayload = {
                tiles: [],
                orientation: Orientation.Horizontal,
                startPosition: { row: 0, column: 0 },
            };
            service.emitGameViewEvent(event, payload);
            expect(subjectSpy).toHaveBeenCalledWith(payload);
        });
    });

    describe('subscribeToGameViewEvent', () => {
        let eventMapSpy: unknown;
        let subjectMock: Subject<any>;
        let pipedSubjectMock: Subject<any>;
        let pipeSpy: unknown;
        let subscribeSpy: unknown;

        let componentDestroyed$: Observable<boolean>;

        const fakeNext = () => {
            return;
        };

        beforeEach(() => {
            subjectMock = new Subject();
            pipedSubjectMock = new Subject();
            eventMapSpy = spyOn<any>(service, 'getSubjectFromMap').and.callFake(() => subjectMock);
            pipeSpy = spyOn(subjectMock, 'pipe').and.callFake(() => pipedSubjectMock);
            subscribeSpy = spyOn(pipedSubjectMock, 'subscribe').and.callFake(() => {
                return new Subscription();
            });
            componentDestroyed$ = new Observable();
        });

        it('should call getSubjectFromMap', () => {
            const event = 'tileRackUpdate';
            service.subscribeToGameViewEvent(event, componentDestroyed$, fakeNext);
            expect(eventMapSpy).toHaveBeenCalledWith(event);
        });

        it('should call pipe returned subject', () => {
            const event = 'tileRackUpdate';
            service.subscribeToGameViewEvent(event, componentDestroyed$, fakeNext);
            expect(pipeSpy).toHaveBeenCalled();
        });

        it('should call subscribe to subject and bind the provided function', () => {
            const event = 'tileRackUpdate';
            service.subscribeToGameViewEvent(event, componentDestroyed$, fakeNext);
            expect(subscribeSpy).toHaveBeenCalledWith(fakeNext);
        });
    });

    describe('getSubjectFromMap', () => {
        const mockEventMap: Map<keyof EventTypes, Subject<any>> = new Map();
        const tileRackSubject: Subject<string> = new Subject<string>();
        const reRenderSubject: Subject<void> = new Subject<void>();

        beforeEach(() => {
            mockEventMap.set('tileRackUpdate', tileRackSubject);
            mockEventMap.set('reRender', reRenderSubject);

            service['eventMap'] = mockEventMap;
        });

        it('should return the Subject<string> associated with event name', () => {
            const event = 'tileRackUpdate';
            const subject: Subject<any> = service['getSubjectFromMap'](event);
            expect(subject).toEqual(tileRackSubject);
        });

        it('should return the Subject<void> associated with event name', () => {
            const event = 'reRender';
            const subject: Subject<any> = service['getSubjectFromMap'](event);
            expect(subject).toEqual(reRenderSubject);
        });

        it('should throw error if event is not in the map', () => {
            const event: keyof EventTypes = undefined as unknown as keyof EventTypes;
            expect(() => service['getSubjectFromMap'](event)).toThrowError(SERVICE_ERRORS.NO_SUBJECT_FOR_EVENT);
        });
    });
});
