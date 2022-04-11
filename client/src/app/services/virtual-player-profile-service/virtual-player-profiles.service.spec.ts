/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VirtualPlayerProfileData } from '@app/classes/communication/virtual-player-profiles';
import { ERROR_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
import { MOCK_PLAYER_PROFILES } from '@app/constants/service-test-constants';
import { VirtualPlayerProfilesController } from '@app/controllers/virtual-player-profiles-controller/virtual-player-profiles.controller';
import { Observable, Subject, throwError } from 'rxjs';
import { VirtualPlayerProfilesService } from './virtual-player-profiles.service';

describe('VirtualPlayerProfilesService', () => {
    let service: VirtualPlayerProfilesService;
    let controllerSpy: jasmine.SpyObj<VirtualPlayerProfilesController>;

    beforeEach(() => {
        controllerSpy = jasmine.createSpyObj(VirtualPlayerProfilesController, {
            getVirtualPlayerProfiles: new Observable<VirtualPlayerProfileData>(),
        });

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatSnackBarModule],
            providers: [{ provide: VirtualPlayerProfilesController, useValue: controllerSpy }, MatSnackBar],
        });
        service = TestBed.inject(VirtualPlayerProfilesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getVirtualPlayerProfiles', () => {
        let handleErrorSpy: jasmine.Spy;

        beforeEach(() => {
            handleErrorSpy = spyOn<any>(service, 'handleError').and.callFake(() => {});
        });

        it('should call getVirtualPlayerProfiles', () => {
            service.getVirtualPlayerProfiles();
            expect(controllerSpy.getVirtualPlayerProfiles).toHaveBeenCalled();
        });

        it('should resolve profiles in result', (done) => {
            const expected: VirtualPlayerProfileData = { virtualPlayerProfiles: MOCK_PLAYER_PROFILES };
            const subject = new Subject<VirtualPlayerProfileData>();
            controllerSpy.getVirtualPlayerProfiles.and.returnValue(subject);

            service
                .getVirtualPlayerProfiles()
                .then((result) => {
                    expect(result).toEqual(expected.virtualPlayerProfiles);
                })
                .catch(() => {
                    expect(false).toBeTrue();
                })
                .finally(() => {
                    done();
                });

            subject.next(expected);
        });

        it('should call handleError on error', (done) => {
            controllerSpy.getVirtualPlayerProfiles.and.returnValue(throwError('error'));

            service.getVirtualPlayerProfiles().finally(() => {
                expect(handleErrorSpy).toHaveBeenCalledWith('error');
                done();
            });
        });

        it('should reject on error', (done) => {
            controllerSpy.getVirtualPlayerProfiles.and.returnValue(throwError('error'));

            let success = false;
            service
                .getVirtualPlayerProfiles()
                .catch(() => {
                    success = true;
                })
                .finally(() => {
                    expect(success).toBeTrue();
                    done();
                });
        });
    });

    it('handleError should open Snack Bar with right config', () => {
        const snackBarSpy = spyOn(service['snackBar'], 'open');
        const error: HttpErrorResponse = { error: { message: 'error' } } as HttpErrorResponse;

        service['handleError'](error);
        expect(snackBarSpy).toHaveBeenCalledWith(error.error.message, 'Fermer', ERROR_SNACK_BAR_CONFIG);
    });
});
