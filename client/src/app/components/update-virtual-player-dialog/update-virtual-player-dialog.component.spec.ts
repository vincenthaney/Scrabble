/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppMaterialModule } from '@app/modules/material.module';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { UpdateVirtualPlayerComponent } from './update-virtual-player-dialog.component';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profiles.service';
import { AbstractControl } from '@angular/forms';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { UpdateVirtualPlayerDialogParameters } from './update-virtual-player.component.types';

const VIRTUAL_PLAYER_NAME: string = 'steve';
export class MatDialogMock {
    close() {
        return {
            close: () => ({}),
        };
    }
}

const MODEL: UpdateVirtualPlayerDialogParameters = {
    name: 'testName',
    level: VirtualPlayerLevel.Beginner,
    id: 'eyedee',
};

describe('UpdateDictionaryComponent', () => {
    let component: UpdateVirtualPlayerComponent;
    let fixture: ComponentFixture<UpdateVirtualPlayerComponent>;
    let service: VirtualPlayerProfilesService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UpdateVirtualPlayerComponent, IconComponent, PageHeaderComponent],
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
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: MODEL,
                },
                VirtualPlayerProfilesService,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UpdateVirtualPlayerComponent);
        service = TestBed.inject(VirtualPlayerProfilesService);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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

    describe('onPlayerNameChanges', () => {
        it('change value of virtualPlayerName', () => {
            component.onPlayerNameChanges([VIRTUAL_PLAYER_NAME, true]);
            expect(component['virtualPlayerName']).toEqual(VIRTUAL_PLAYER_NAME);
        });
        it('change value of isVirtualPlayerNameValid', () => {
            component.onPlayerNameChanges([VIRTUAL_PLAYER_NAME, true]);
            expect(component['isVirtualPlayerNameValid']).toEqual(true);
        });
    });

    describe('createVirtualPlayer', () => {
        let spyDictionary: jasmine.Spy;
        let spyClose: jasmine.Spy;
        beforeEach(() => {
            spyDictionary = spyOn(service, 'updateVirtualPlayer').and.callFake(async () => {
                return;
            });
            spyClose = spyOn(component, 'closeDialog').and.callFake(() => {
                return;
            });
        });

        it('should call virtualPlayerProfilesService.updateVirtualPlayer with get returning null', () => {
            spyOn(component.formParameters, 'get').and.callFake(() => {
                return null;
            });
            component.updateVirtualPlayer();
            expect(spyDictionary).toHaveBeenCalled();
        });

        it('should call virtualPlayerProfilesService.updateVirtualPlayer with get returning Abstract Control', () => {
            spyOn(component.formParameters, 'get').and.callFake(() => {
                return {} as AbstractControl;
            });
            component.updateVirtualPlayer();
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
