/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
import { IconComponent } from '@app/components/icon/icon.component';
import { AdminDictionariesComponent } from './admin-dictionaries.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AppMaterialModule } from '@app/modules/material.module';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DictionarySummary } from '@app/classes/communication/dictionary-summary';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
const TEST_ID = 'test';
const testElementData: DictionarySummary = {
    title: 'testTitle',
    description: 'testDescription',
    id: 'testId',
    isDefault: false,
};
const TEST_DICTIONARY_SUMMARY_ARRAY: DictionarySummary[] = [testElementData];
const TEST_SNACKBAR = undefined as unknown as MatSnackBarRef<TextOnlySnackBar>;

describe('AdminDictionariesComponent', () => {
    let component: AdminDictionariesComponent;
    let fixture: ComponentFixture<AdminDictionariesComponent>;
    let dictionariesServiceMock: DictionaryService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminDictionariesComponent, IconComponent, PageHeaderComponent],
            imports: [
                AppMaterialModule,
                HttpClientModule,
                MatFormFieldModule,
                MatSelectModule,
                MatDividerModule,
                MatProgressSpinnerModule,
                MatTableModule,
                MatDialogModule,
                MatSnackBarModule,
                BrowserAnimationsModule,
                MatCardModule,
                MatTabsModule,
            ],
            providers: [DictionaryService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminDictionariesComponent);
        dictionariesServiceMock = TestBed.inject(DictionaryService);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('On dictionariesUpdateMessageEvent', () => {
        it('should call dictionariesService.getDictionaries', () => {
            const spy = spyOn(dictionariesServiceMock, 'getDictionaries').and.callFake(() => {
                return TEST_DICTIONARY_SUMMARY_ARRAY;
            });
            spyOn<any>(component, 'convertDictionariesToMatDataSource').and.callFake(() => {
                return;
            });
            dictionariesServiceMock['dictionariesUpdateMessageEvent'].next();
            expect(spy).toHaveBeenCalled();
        });

        it('should call convertDictionariesToMatDataSource', () => {
            spyOn(dictionariesServiceMock, 'getDictionaries').and.callFake(() => {
                return TEST_DICTIONARY_SUMMARY_ARRAY;
            });
            const spy = spyOn<any>(component, 'convertDictionariesToMatDataSource').and.callFake(() => {
                return;
            });
            dictionariesServiceMock['dictionariesUpdateMessageEvent'].next();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('On dictionariesUpdateDataEvent', () => {
        it('should call dictionariesService.getDictionaries', () => {
            const spy = spyOn(dictionariesServiceMock, 'getDictionaries').and.callFake(() => {
                return TEST_DICTIONARY_SUMMARY_ARRAY;
            });
            spyOn<any>(component, 'convertDictionariesToMatDataSource').and.callFake(() => {
                return;
            });
            dictionariesServiceMock['dictionariesUpdatedEvent'].next();
            expect(spy).toHaveBeenCalled();
        });

        it('should call convertDictionariesToMatDataSource', () => {
            spyOn(dictionariesServiceMock, 'getDictionaries').and.callFake(() => {
                return TEST_DICTIONARY_SUMMARY_ARRAY;
            });
            const spy = spyOn<any>(component, 'convertDictionariesToMatDataSource').and.callFake(() => {
                return;
            });
            dictionariesServiceMock['dictionariesUpdatedEvent'].next();
            expect(spy).toHaveBeenCalled();
        });

        it('should should turn isWaitingForServerResponse to false', () => {
            dictionariesServiceMock['dictionariesUpdatedEvent'].next();
            expect(component.isWaitingForServerResponse).toBeFalse();
        });
    });

    describe('On isWaitingForServerResponseEvent', () => {
        it('should turn isDownloadLoading to false', () => {
            dictionariesServiceMock['isWaitingForServerResponseEvent'].next();
            expect(component.isWaitingForServerResponse).toBeFalse();
        });

        it('should should turn isWaitingForServerResponse to false', () => {
            dictionariesServiceMock['isWaitingForServerResponseEvent'].next();
            expect(component.isWaitingForServerResponse).toBeFalse();
        });
    });

    describe('On ComponentUpdateEvent', () => {
        it('should call snackbar.open', () => {
            const spy = spyOn(component['snackBar'], 'open').and.callFake(() => {
                return TEST_SNACKBAR;
            });
            dictionariesServiceMock['componentUpdateEvent'].next();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('modifyDictionary', () => {
        it('should call dialog.open', () => {
            const spy = spyOn(component.dialog, 'open');
            component.modifyDictionary(testElementData);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('uploadDictionary', () => {
        it('should call dialog.open', () => {
            const spy = spyOn(component.dialog, 'open');
            component.uploadDictionary();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('deleteDictionary', () => {
        it('should call dialog.open', () => {
            const spy = spyOn(component.dialog, 'open');
            component.deleteDictionary(testElementData);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('downloadDictionary', async () => {
        it('should call dictionariesService.downloadDictionary', async () => {
            const spy = spyOn(dictionariesServiceMock, 'downloadDictionary');
            await component.downloadDictionary(TEST_ID);
            expect(spy).toHaveBeenCalled();
        });

        it('should turn isWaitingForServerResponse to true', async () => {
            spyOn(dictionariesServiceMock, 'downloadDictionary');
            await component.downloadDictionary(TEST_ID);
            expect(component.isWaitingForServerResponse).toBeTrue();
        });
    });

    describe('resetDictionaries', async () => {
        it('should call dictionariesService.resetDictionaries', async () => {
            const spy = spyOn(dictionariesServiceMock, 'resetDictionaries');
            await component.resetDictionaries();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('sortDictionaries', () => {
        it('should call return item.title', () => {
            expect(component.sortDictionaries(testElementData, 'dictionaryName')).toEqual('testTitle');
        });

        it('should call return item.description', () => {
            expect(component.sortDictionaries(testElementData, 'dictionaryDescription')).toEqual('testDescription');
        });
    });

    describe('convertDictionariesToMatDataSource', async () => {
        it('should assign new MattableDataSource filled with TestArrayDictionarySummary[] to dataSource', async () => {
            await component['convertDictionariesToMatDataSource'](TEST_DICTIONARY_SUMMARY_ARRAY);
            expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
        });
    });
});
