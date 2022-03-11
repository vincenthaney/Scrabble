/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
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

        it('should call next with payload if payload is provided', () => {
            const event = 'tileRackUpdate';
            service.emitGameViewEvent(event);
            expect(eventMapSpy).toHaveBeenCalledWith(event);
        });
    });
});
