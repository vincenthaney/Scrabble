import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DisplayDictionariesColumnsIteratorItem, DisplayDictionariesKeys, DictionariesState } from '@app/classes/admin/dictionaries';
import { DictionarySummary } from '@app/classes/communication/dictionary';
import { DEFAULT_DICTIONARIES_COLUMNS, DICTIONARIES_COLUMNS } from '@app/constants/components-constants';
import { isKey } from '@app/utils/is-key';
import { ModifyDictionaryComponent } from '@app/components/modify-dictionary-dialog/modify-dictionary-dialog.component';
import { DictionaryDialogParameters } from '@app/components/modify-dictionary-dialog/modify-dictionary-dialog.component.types';
import { DictionariesService } from '@app/services/dictionaries-service/dictionaries.service';
import { Subject } from 'rxjs';
import { UploadDictionaryComponent } from '@app/components/upload-dictionary/upload-dictionary.component';
import { DeleteDictionaryDialogComponent } from '@app/components/delete-dictionary-dialog/delete-dictionary-dialog.component';
import { DeleteDictionaryDialogParameters } from '@app/components/delete-dictionary-dialog/delete-dictionary-dialog.component.types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PositiveFeedback, SNACK_BAR_ERROR_DURATION, SNACK_BAR_SUCCESS_DURATION } from '@app/constants/dictionaries-components';
import { PositiveFeedbackResponse } from './admin-dictionaries-component.types';

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    columns;
    columnsItems: DisplayDictionariesColumnsIteratorItem[];
    selectedColumnsItems: DisplayDictionariesColumnsIteratorItem[];
    columnsControl: FormControl;
    dictionaries: DictionarySummary[];
    dataSource: MatTableDataSource<DictionarySummary>;
    state: DictionariesState;
    error: string | undefined;
    isWaitingForServerResponse: boolean;

    private serviceDestroyed$: Subject<boolean> = new Subject();
    constructor(public dialog: MatDialog, private dictionariesService: DictionariesService, private snackBar: MatSnackBar) {
        this.columns = DICTIONARIES_COLUMNS;
        this.columnsItems = [];
        this.selectedColumnsItems = [];
        this.dataSource = new MatTableDataSource(new Array());
        this.dataSource.sortingDataAccessor = this.sortDictionaries;
        this.columnsItems = this.getColumnIterator();
        this.selectedColumnsItems = this.getSelectedColumns();
        this.columnsControl = new FormControl();
        this.columnsControl.setValue(this.selectedColumnsItems);
        this.dataSource = new MatTableDataSource(new Array());
        this.state = DictionariesState.Loading;
        this.error = undefined;

        this.initializeSubscriptions();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    async ngOnInit(): Promise<void> {
        await this.dictionariesService.updateAllDictionaries();
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
            height: '33%',
            width: '25%',
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
        await this.dictionariesService.deleteAllDictionaries();
    }

    sortDictionaries(dictionarySummary: DictionarySummary, property: string): string {
        switch (property) {
            case 'dictionaryName':
                return dictionarySummary.title;
            case 'dictionaryDescription':
                return dictionarySummary.description;
            default:
                return isKey(property, dictionarySummary) ? (dictionarySummary[property] as string) : '';
        }
    }

    getColumnIterator(): DisplayDictionariesColumnsIteratorItem[] {
        return Object.keys(this.columns).map<DisplayDictionariesColumnsIteratorItem>((key) => ({
            key: key as DisplayDictionariesKeys,
            label: this.columns[key as DisplayDictionariesKeys],
        }));
    }

    getDisplayedColumns(): DisplayDictionariesKeys[] {
        return this.selectedColumnsItems.map(({ key }) => key);
    }

    getSelectedColumns(): DisplayDictionariesColumnsIteratorItem[] {
        return DEFAULT_DICTIONARIES_COLUMNS.map<DisplayDictionariesColumnsIteratorItem>(
            (key) => this.columnsItems.find((item) => item.key === key) || { key, label: this.columns[key] },
        );
    }

    private convertDictionariesToMatDataSource(dictionaries: DictionarySummary[]): void {
        this.dataSource = new MatTableDataSource(dictionaries);
    }

    private initializeSubscriptions(): void {
        this.dictionariesService.subscribeToDictionariesUpdateMessageEvent(this.serviceDestroyed$, () => {
            this.convertDictionariesToMatDataSource(this.dictionariesService.getDictionaries());
        });
        this.dictionariesService.subscribeToDictionariesUpdateDataEvent(this.serviceDestroyed$, () => {
            this.convertDictionariesToMatDataSource(this.dictionariesService.getDictionaries());
        });
        this.dictionariesService.subscribeToIsWaitingForServerResponseEvent(this.serviceDestroyed$, () => {
            this.isWaitingForServerResponse = !this.isWaitingForServerResponse;
        });
        this.dictionariesService.subscribeToComponentUpdateEvent(this.serviceDestroyed$, (response) => {
            this.snackBar.open(response, 'OK', this.isFeedbackPositive(response as PositiveFeedback));
        });
        this.dictionariesService.subscribeToUpdatingDictionariesEvent(this.serviceDestroyed$, (state) => {
            this.state = state;
            this.isWaitingForServerResponse = !this.isWaitingForServerResponse;
        });
    }

    private isFeedbackPositive(response: PositiveFeedback): PositiveFeedbackResponse {
        return Object.values(PositiveFeedback).includes(response as PositiveFeedback)
            ? { duration: SNACK_BAR_SUCCESS_DURATION, panelClass: ['success'] }
            : { duration: SNACK_BAR_ERROR_DURATION, panelClass: ['error'] };
    }
}
