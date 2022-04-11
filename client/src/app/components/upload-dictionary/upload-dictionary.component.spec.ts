/* eslint-disable @typescript-eslint/no-empty-function */
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
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { UploadDictionaryComponent } from './upload-dictionary.component';
import { DictionaryData } from '@app/classes/dictionary/dictionary-data';
import { UploadEvent } from './upload-dictionary.component.types';
// const TEST_FILE = { test: 'I am a test file' };
const TEST_EVENT: UploadEvent = {
    addEventListener: () => {},
    dispatchEvent: () => {
        return false;
    },
    removeEventListener: () => {},
    files: [{ iAmValue: 'heyhey' } as unknown as File],
};

export class MatDialogMock {
    close() {
        return {
            close: () => ({}),
        };
    }
}

describe('UploadDictionaryComponent', () => {
    let component: UploadDictionaryComponent;
    let fixture: ComponentFixture<UploadDictionaryComponent>;
    let dictionariesServiceMock: DictionaryService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UploadDictionaryComponent, IconComponent, PageHeaderComponent],
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
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadDictionaryComponent);
        dictionariesServiceMock = TestBed.inject(DictionaryService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('handleFileInput', () => {
        let spyReadAsText: jasmine.Spy;
        beforeEach(() => {
            spyReadAsText = spyOn(FileReader.prototype, 'readAsText').and.callFake(() => {
                return;
            });
        });

        it('should assign value to component.selectedFile', () => {
            spyOn(JSON, 'parse').and.callFake(() => {
                return {} as DictionaryData;
            });
            component.handleFileInput(TEST_EVENT);
            expect(spyReadAsText).toHaveBeenCalled();
        });

        // it('should call JSON.parse', () => {
        //     const spyParse = spyOn(JSON, 'parse').and.callFake(() => {
        //         return {} as DictionaryData;
        //     });
        //     component.onFileChanged(TEST_EVENT);
        //     expect(spyParse).toHaveBeenCalled();
        // });

        // it('should assign error message to compoenent.error message when JSON.parse throws', () => {
        //     spyOn(JSON, 'parse').and.callFake(() => {
        //         throw new Error('testError');
        //     });
        //     component.onFileChanged(TEST_EVENT);
        //     expect(component.errorMessage).toEqual('testError');
        // });
    });

    describe('onUpload', () => {
        let spyDictionary: jasmine.Spy;
        let spyDialogRef: jasmine.Spy;
        beforeEach(() => {
            spyDictionary = spyOn(dictionariesServiceMock, 'uploadDictionary').and.callFake(async () => {
                return;
            });
            spyDialogRef = spyOn(component['dialogRef'], 'close').and.callFake(() => {
                return;
            });
        });

        it('should call dictionariesService.uploadDictionary', () => {
            component.onUpload();
            expect(spyDictionary).toHaveBeenCalled();
        });

        it('should call dialogRef.close', () => {
            component.onUpload();
            expect(spyDialogRef).toHaveBeenCalled();
        });
    });

    describe('closeDialog', () => {
        it('should call dialogRef.close', () => {
            const spyDialogRef = spyOn(component['dialogRef'], 'close').and.callFake(() => {
                return;
            });
            component.closeDialog();
            expect(spyDialogRef).toHaveBeenCalled();
        });
    });
});
