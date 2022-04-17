/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { VirtualPlayerData } from '@app/classes/admin/virtual-player-profile';
import { of, Subject } from 'rxjs';
import { VirtualPlayerProfilesController } from './virtual-player-profiles.controller';
const TEST_VIRTUAL_PLAYER_DATA = {} as VirtualPlayerData;
const TEST_ID = 'iamtheidthatwillbetested';

describe('VirtualPlayerProfilesController', () => {
    let controller: VirtualPlayerProfilesController;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [VirtualPlayerProfilesController],
        });
        controller = TestBed.inject(VirtualPlayerProfilesController);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });

    describe('ngOnDestroy', () => {
        it('should call next', () => {
            const spy = spyOn(controller['serviceDestroyed$'], 'next');
            spyOn(controller['serviceDestroyed$'], 'complete');
            controller.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call complete', () => {
            spyOn(controller['serviceDestroyed$'], 'next');
            const spy = spyOn(controller['serviceDestroyed$'], 'complete');
            controller.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleGetAllVirtualPlayerProfilesEvent', () => {
        it('should  make an HTTP get request', async () => {
            const httpGetSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
            controller.handleGetAllVirtualPlayerProfilesEvent();
            expect(httpGetSpy).toHaveBeenCalled();
        });
    });

    describe('handleCreateVirtualPlayerProfileEvent', () => {
        it('should  make an HTTP post request', async () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            controller.handleCreateVirtualPlayerProfileEvent(TEST_VIRTUAL_PLAYER_DATA);
            expect(httpPostSpy).toHaveBeenCalled();
        });
    });

    describe('handleUpdateVirtualPlayerProfileEvent', () => {
        it('handleUpdateVirtualPlayerProfileEvent should  make an HTTP patch request', async () => {
            spyOn(HttpParams.prototype, 'append').and.returnValue({} as HttpParams);
            const httpPatchSpy = spyOn(controller['http'], 'patch').and.returnValue(of(true) as any);
            await controller.handleUpdateVirtualPlayerProfileEvent(TEST_VIRTUAL_PLAYER_DATA);
            expect(httpPatchSpy).toHaveBeenCalled();
        });
    });

    describe('handleDeleteVirtualPlayerProfileEvent', () => {
        it('handleDeleteVirtualPlayerProfileEvent should  make an HTTP delete request', async () => {
            const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            controller.handleDeleteVirtualPlayerProfileEvent(TEST_ID);
            expect(httpDeleteSpy).toHaveBeenCalled();
        });
    });

    describe('handleResetVirtualPlayerProfilesEvent', () => {
        it('handleResetVirtualPlayerProfilesEvent should  make an HTTP delete request', async () => {
            const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            controller.handleResetVirtualPlayerProfilesEvent();
            expect(httpDeleteSpy).toHaveBeenCalled();
        });
    });

    describe('subscriptions', () => {
        let serviceDestroyed$: Subject<boolean>;
        let callback: () => void;

        beforeEach(() => {
            serviceDestroyed$ = new Subject();
            callback = () => {
                return;
            };
        });

        it('should subscribe to GetAllVirtualPlayersEvent', () => {
            const subscribeSpy = spyOn<any>(controller['getAllVirtualPlayersEvent'], 'subscribe');
            controller.subscribeToGetAllVirtualPlayersEvent(serviceDestroyed$, callback);
            expect(subscribeSpy).toHaveBeenCalled();
        });

        it('should subscribe to VirtualPlayerErrorEvent', () => {
            const subscribeSpy = spyOn<any>(controller['virtualPlayerErrorEvent'], 'subscribe');
            controller.subscribeToVirtualPlayerErrorEvent(serviceDestroyed$, callback);
            expect(subscribeSpy).toHaveBeenCalled();
        });

        it('should subscribe to VirtualPlayerServerResponseEvent', () => {
            const subscribeSpy = spyOn<any>(controller['virtualPlayerServerResponseEvent'], 'subscribe');
            controller.subscribeToVirtualPlayerServerResponseEvent(serviceDestroyed$, callback);
            expect(subscribeSpy).toHaveBeenCalled();
        });
    });
});
