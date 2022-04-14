/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
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
import { ModifyDictionaryComponent } from './modify-dictionary-dialog.component';
import { DictionaryDialogParameters, ModifyDictionaryComponentStates } from './modify-dictionary-dialog.component.types';
import { AbstractControl } from '@angular/forms';

const MODEL: DictionaryDialogParameters = {
    dictionaryId: 'testId',
    dictionaryToModifyTitle: 'testTitle',
    dictionaryToModifyDescription: 'testDescription',
};

export class MatDialogMock {
    close() {
        return {
            close: () => ({}),
        };
    }
}

describe('ModifyDictionaryComponent', () => {
    let component: ModifyDictionaryComponent;
    let fixture: ComponentFixture<ModifyDictionaryComponent>;
    let dictionariesServiceMock: DictionaryService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModifyDictionaryComponent, IconComponent, PageHeaderComponent],
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
                DictionaryService,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: MODEL,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ModifyDictionaryComponent);
        dictionariesServiceMock = TestBed.inject(DictionaryService);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('On componentUpdateEvent', () => {
        it('should call component.cleanupState()', () => {
            const spy = spyOn(component, 'cleanupDialogStates').and.callFake(() => {
                return;
            });
            dictionariesServiceMock['componentUpdateEvent'].next();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngOnChanges', () => {
        it('should call formParameters.get twice', () => {
            const spyFormParameters = spyOn(component.formParameters, 'get').and.callFake(() => {
                return null;
            });
            component.ngOnChanges();
            expect(spyFormParameters).toHaveBeenCalledTimes(2);
        });

        it('should call formParameters.get and return valid', () => {
            spyOn(component.formParameters, 'get').and.callFake(() => {
                return { valid: true } as unknown as AbstractControl;
            });
            component.ngOnChanges();
            expect(component.isDictionaryTitleValid).toBeTrue();
        });

        it('should call formParameters.get and return false', () => {
            spyOn(component.formParameters, 'get').and.callFake(() => {
                return null;
            });
            component.ngOnChanges();
            expect(component.isDictionaryTitleValid).toBeFalse();
        });
    });

    describe('updateDictionary', () => {
        let spyDictionary: jasmine.Spy;
        let spyFormParameters: jasmine.Spy;
        let spyClose: jasmine.Spy;
        beforeEach(() => {
            spyDictionary = spyOn(dictionariesServiceMock, 'updateDictionary').and.callFake(async () => {
                return;
            });
            spyClose = spyOn(component, 'closeDialog').and.callFake(() => {
                return;
            });
        });

        it('should call dictionariesService.updateDictionary', () => {
            spyOn(component.formParameters, 'get').and.callFake(() => {
                return null;
            });
            component.updateDictionary();
            expect(spyDictionary).toHaveBeenCalled();
        });

        it('should call formParameters.get twice', () => {
            spyFormParameters = spyOn(component.formParameters, 'get').and.callFake(() => {
                return null;
            });
            component.updateDictionary();
            expect(spyFormParameters).toHaveBeenCalledTimes(2);
        });

        it('shouldhave been called with formParameters.get values undefined', () => {
            spyFormParameters = spyOn(component.formParameters, 'get').and.callFake(() => {
                return null;
            });
            component.updateDictionary();
            expect(spyFormParameters).toHaveBeenCalledTimes(2);
        });

        it('should have been called with all values defined', () => {
            spyFormParameters = spyOn(component.formParameters, 'get').and.callFake(() => {
                return { value: 'i am a defined value' } as unknown as AbstractControl;
            });
            component.updateDictionary();
            expect(spyFormParameters).toHaveBeenCalledTimes(2);
        });

        it('should call closeDialog', () => {
            spyOn(component.formParameters, 'get').and.callFake(() => {
                return null;
            });
            component.updateDictionary();
            expect(spyClose).toHaveBeenCalled();
        });
    });

    describe('closeDialog', () => {
        let spyDialog: jasmine.Spy;
        let spyCleanup: jasmine.Spy;
        beforeEach(() => {
            spyDialog = spyOn(component['dialogRef'], 'close').and.callFake(() => {
                return;
            });
            spyCleanup = spyOn(component, 'cleanupDialogStates').and.callFake(() => {
                return;
            });
        });

        it('should call dialogRef.close()', () => {
            component.closeDialog();
            expect(spyDialog).toHaveBeenCalled();
        });

        it('should call cleanupDialogStates()', () => {
            component.closeDialog();
            expect(spyCleanup).toHaveBeenCalled();
        });
    });

    describe('isInformationValid', () => {
        it('should return true if component.isDictionaryTitleValid && component.isDictionaryDescriptionValid', () => {
            component.isDictionaryTitleValid = true;
            component.isDictionaryDescriptionValid = true;
            expect(component.isInformationValid()).toBeTrue();
        });
        it('should return false if !component.isDictionaryTitleValid && component.isDictionaryDescriptionValid', () => {
            component.isDictionaryTitleValid = false;
            component.isDictionaryDescriptionValid = true;
            expect(component.isInformationValid()).toBeFalse();
        });
        it('should return false if component.isDictionaryTitleValid && !component.isDictionaryDescriptionValid', () => {
            component.isDictionaryTitleValid = false;
            component.isDictionaryDescriptionValid = true;
            expect(component.isInformationValid()).toBeFalse();
        });
        it('should return false if !component.isDictionaryTitleValid && !component.isDictionaryDescriptionValid', () => {
            component.isDictionaryTitleValid = false;
            component.isDictionaryDescriptionValid = true;
            expect(component.isInformationValid()).toBeFalse();
        });
    });

    describe('cleanupDialogStates', () => {
        it('should turn state to Ready', () => {
            component.cleanupDialogStates();
            expect(component.state).toEqual(ModifyDictionaryComponentStates.Ready);
        });
    });
});
