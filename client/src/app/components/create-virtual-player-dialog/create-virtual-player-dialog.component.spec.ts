/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppMaterialModule } from '@app/modules/material.module';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CreateVirtualPlayerComponent } from './create-virtual-player-dialog.component';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profiles.service';
import { AbstractControl } from '@angular/forms';

export class MatDialogMock {
    close() {
        return {
            close: () => ({}),
        };
    }
}

describe('CreateVirtualPlayerComponent', () => {
    let component: CreateVirtualPlayerComponent;
    let fixture: ComponentFixture<CreateVirtualPlayerComponent>;
    let service: VirtualPlayerProfilesService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateVirtualPlayerComponent, IconComponent, PageHeaderComponent],
            imports: [
                AppMaterialModule,
                HttpClientModule,
                MatFormFieldModule,
                MatSelectModule,
                MatDividerModule,
                MatProgressSpinnerModule,
                MatDialogModule,
                MatSnackBarModule,
                BrowserAnimationsModule,
                MatCardModule,
                MatTabsModule,
            ],
            providers: [
                MatDialog,
                {
                    provide: MatDialogRef,
                    useClass: MatDialogMock,
                },
                VirtualPlayerProfilesService,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateVirtualPlayerComponent);
        service = TestBed.inject(VirtualPlayerProfilesService);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('On componentUpdateEvent', () => {
        // it('should call component.cleanupState()', () => {
        //     const spy = spyOn(component, 'cleanupDialogStates').and.callFake(() => {
        //         return;
        //     });
        //     dictionariesServiceMock['componentUpdateEvent'].next();
        //     expect(spy).toHaveBeenCalled();
        // });
    });

    describe('ngOnDestroy', () => {
        it('should call componentDestroyed$.next with true', () => {
            const spyNext = spyOn(component['componentDestroyed$'], 'next').and.callFake(() => {
                return null;
            });
            spyOn(component['componentDestroyed$'], 'complete').and.callFake(() => {
                return null;
            });
            component.ngOnDestroy();
            expect(spyNext).toHaveBeenCalled();
            expect(spyNext).toHaveBeenCalledWith(true);
        });

        it('should call componentDestroyed$.complete with true', () => {
            const spyComplete = spyOn(component['componentDestroyed$'], 'complete').and.callFake(() => {
                return null;
            });
            spyOn(component['componentDestroyed$'], 'next').and.callFake(() => {
                return null;
            });
            component.ngOnDestroy();
            expect(spyComplete).toHaveBeenCalled();
        });
    });

    describe('ngOnChanges', () => {
        it('should call formParameters.get once with null', () => {
            const spyFormParameters = spyOn(component.formParameters, 'get').and.callFake(() => {
                return null;
            });
            component.ngOnChanges();
            expect(spyFormParameters).toHaveBeenCalledTimes(1);
        });

        it('should call formParameters.get once with get returning Abstract Control to true', () => {
            const spyFormParameters = spyOn(component.formParameters, 'get').and.callFake(() => {
                return { valid: true } as AbstractControl;
            });
            component.ngOnChanges();
            expect(spyFormParameters).toHaveBeenCalledTimes(1);
        });

        it('should call formParameters.get once with get returning Abstract Control to false', () => {
            const spyFormParameters = spyOn(component.formParameters, 'get').and.callFake(() => {
                return { valid: false } as AbstractControl;
            });
            component.ngOnChanges();
            expect(spyFormParameters).toHaveBeenCalledTimes(1);
        });
    });

    describe('createVirtualPlayer', () => {
        let spyDictionary: jasmine.Spy;
        let spyClose: jasmine.Spy;
        beforeEach(() => {
            spyDictionary = spyOn(service, 'createVirtualPlayer').and.callFake(async () => {
                return;
            });
            spyClose = spyOn(component, 'closeDialog').and.callFake(() => {
                return;
            });
        });

        it('should call virtualPlayerProfilesService.createVirtualPlayer with get returning null', () => {
            spyOn(component.formParameters, 'get').and.callFake(() => {
                return null;
            });
            component.createVirtualPlayer();
            expect(spyDictionary).toHaveBeenCalled();
        });

        it('should call virtualPlayerProfilesService.createVirtualPlayer with get returning Abstract Control', () => {
            spyOn(component.formParameters, 'get').and.callFake(() => {
                return {} as AbstractControl;
            });
            component.createVirtualPlayer();
            expect(spyDictionary).toHaveBeenCalled();
        });

        it('should call dialogRef.close()', () => {
            spyOn(component['dialogRef'], 'close').and.callFake(() => {
                return;
            });
            component.closeDialog();
            expect(spyClose).toHaveBeenCalled();
        });
    });

    describe('closeDialog', () => {
        it('should call dialogRef.close()', () => {
            const spyDialog = spyOn(component['dialogRef'], 'close').and.callFake(() => {
                return;
            });
            component.closeDialog();
            expect(spyDialog).toHaveBeenCalled();
        });
    });
});
