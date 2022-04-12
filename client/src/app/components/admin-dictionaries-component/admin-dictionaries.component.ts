import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
    DictionariesState,
    DisplayDictionaryColumns,
    DisplayDictionaryColumnsIteratorItem,
    DisplayDictionaryKeys,
} from '@app/classes/admin/dictionaries';
import { DictionarySummary } from '@app/classes/communication/dictionary-summary';
import { DeleteDictionaryDialogComponent } from '@app/components/delete-dictionary-dialog/delete-dictionary-dialog.component';
import { DeleteDictionaryDialogParameters } from '@app/components/delete-dictionary-dialog/delete-dictionary-dialog.component.types';
import { ModifyDictionaryComponent } from '@app/components/modify-dictionary-dialog/modify-dictionary-dialog.component';
import { DictionaryDialogParameters } from '@app/components/modify-dictionary-dialog/modify-dictionary-dialog.component.types';
import { UploadDictionaryComponent } from '@app/components/upload-dictionary/upload-dictionary.component';
import { DICTIONARIES_COLUMNS, ERROR_SNACK_BAR_CONFIG, SUCCESS_SNACK_BAR_CONFIG } from '@app/constants/components-constants';
import { PositiveFeedback } from '@app/constants/dictionaries-components';
import { DictionaryService } from '@app/services/dictionary-service/dictionary.service';
import { Subject } from 'rxjs';
import { PositiveFeedbackResponse } from './admin-dictionaries-component.types';

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    columns: DisplayDictionaryColumns;
    columnsItems: DisplayDictionaryColumnsIteratorItem[];
    columnsControl: FormControl;
    dictionaries: DictionarySummary[];
    dataSource: MatTableDataSource<DictionarySummary>;
    state: DictionariesState;
    error: string | undefined;
    isWaitingForServerResponse: boolean;

    private componentDestroyed$: Subject<boolean> = new Subject();
    constructor(public dialog: MatDialog, private dictionariesService: DictionaryService, private snackBar: MatSnackBar) {
        this.columns = DICTIONARIES_COLUMNS;
        this.columnsItems = this.getColumnIterator();
        this.dataSource = new MatTableDataSource(new Array());
        this.state = DictionariesState.Loading;
        this.error = undefined;

        this.initializeSubscriptions();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    ngOnInit(): void {
        this.dictionariesService.updateAllDictionaries();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    modifyDictionary(newDictionary: DictionarySummary): void {
        const newDictionaryData: DictionaryDialogParameters = {
            dictionaryToModifyDescription: newDictionary.description,
            dictionaryToModifyTitle: newDictionary.title,
            dictionaryId: newDictionary.id,
        };
        this.dialog.open(ModifyDictionaryComponent, {
            data: newDictionaryData,
            height: '350px',
            width: '450px',
        });
    }

    uploadDictionary(): void {
        this.dialog.open(UploadDictionaryComponent, {
            height: '300px',
            width: '500px',
        });
    }

    deleteDictionary(dictionary: DictionarySummary): void {
        const dictionaryId: DeleteDictionaryDialogParameters = {
            pageTitle: dictionary.title,
            dictionaryId: dictionary.id,
            onClose: () => {
                this.isWaitingForServerResponse = true;
            },
        };
        this.dialog.open(DeleteDictionaryDialogComponent, { data: dictionaryId });
    }

    async downloadDictionary(dictionaryId: string): Promise<void> {
        this.isWaitingForServerResponse = true;
        await this.dictionariesService.downloadDictionary(dictionaryId);
    }

    async resetDictionaries(): Promise<void> {
        await this.dictionariesService.resetDictionaries();
    }

    getColumnIterator(): DisplayDictionaryColumnsIteratorItem[] {
        return Object.keys(this.columns).map<DisplayDictionaryColumnsIteratorItem>((key) => ({
            key: key as DisplayDictionaryKeys,
            label: this.columns[key as DisplayDictionaryKeys],
        }));
    }

    getDisplayedColumns(): DisplayDictionaryKeys[] {
        return this.columnsItems.map(({ key }) => key);
    }

    private convertDictionariesToMatDataSource(dictionaries: DictionarySummary[]): void {
        this.dataSource.data = dictionaries;
    }

    private initializeSubscriptions(): void {
        this.dictionariesService.subscribeToDictionariesUpdateMessageEvent(this.componentDestroyed$, () => {
            this.convertDictionariesToMatDataSource(this.dictionariesService.getDictionaries());
        });
        this.dictionariesService.subscribeToDictionariesUpdateDataEvent(this.componentDestroyed$, () => {
            this.convertDictionariesToMatDataSource(this.dictionariesService.getDictionaries());
        });
        this.dictionariesService.subscribeToIsWaitingForServerResponseEvent(this.componentDestroyed$, () => {
            this.isWaitingForServerResponse = !this.isWaitingForServerResponse;
        });
        this.dictionariesService.subscribeToComponentUpdateEvent(this.componentDestroyed$, (response) => {
            this.snackBar.open(response, 'OK', this.isFeedbackPositive(response as PositiveFeedback));
        });
        this.dictionariesService.subscribeToUpdatingDictionariesEvent(this.componentDestroyed$, (state) => {
            this.state = state;
            this.isWaitingForServerResponse = !this.isWaitingForServerResponse;
        });
    }

    private isFeedbackPositive(response: PositiveFeedback): PositiveFeedbackResponse {
        return Object.values(PositiveFeedback).includes(response as PositiveFeedback) ? SUCCESS_SNACK_BAR_CONFIG : ERROR_SNACK_BAR_CONFIG;
    }
}
