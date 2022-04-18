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
import { DeleteDictionaryDialogComponent } from './delete-dictionary-dialog.component';
import { DeleteDictionaryComponentStates, DeleteDictionaryDialogParameters } from './delete-dictionary-dialog.component.types';
import { ReactiveFormsModule } from '@angular/forms';

const MODEL: DeleteDictionaryDialogParameters = {
    pageTitle: 'Dialog title',
    dictionaryId: 'testId',
    onClose: () => {
        return;
    },
};

export class MatDialogMock {
    close() {
        return {
            close: () => ({}),
        };
    }
}

describe('DeleteDictionaryComponent', () => {
    let component: DeleteDictionaryDialogComponent;
    let fixture: ComponentFixture<DeleteDictionaryDialogComponent>;
    let dictionariesServiceMock: DictionaryService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DeleteDictionaryDialogComponent, IconComponent, PageHeaderComponent],
            imports: [
                AppMaterialModule,
                HttpClientModule,
                MatFormFieldModule,
                ReactiveFormsModule,
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
        fixture = TestBed.createComponent(DeleteDictionaryDialogComponent);
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

    describe('closeDialog', () => {
        it('should call dialogRef.close()', () => {
            const spy = spyOn(component['dialogRef'], 'close').and.callFake(() => {
                return;
            });
            component.closeDialog();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('cleanupDialogStates', () => {
        it('should turn state to Ready', () => {
            component.cleanupDialogStates();
            expect(component.state).toEqual(DeleteDictionaryComponentStates.Ready);
        });
    });

    describe('deleteDictionary', async () => {
        let spyDictionariesService: jasmine.Spy;
        let spyClose: jasmine.Spy;
        beforeEach(() => {
            spyDictionariesService = spyOn(dictionariesServiceMock, 'deleteDictionary').and.callFake(async () => {
                return;
            });
            spyClose = spyOn(component, 'closeDialog').and.callFake(async () => {
                return;
            });
        });

        it('should turn state to Loading', async () => {
            await component.deleteDictionary();
            expect(component.state).toEqual(DeleteDictionaryComponentStates.Loading);
        });

        it('should call dictionariesService.deleteDictionary', async () => {
            await component.deleteDictionary();
            expect(spyDictionariesService).toHaveBeenCalled();
        });

        it('should call component.closeDialog', async () => {
            await component.deleteDictionary();
            expect(spyClose).toHaveBeenCalled();
        });
    });
});
