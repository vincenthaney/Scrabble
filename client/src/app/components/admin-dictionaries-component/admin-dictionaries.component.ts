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

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    columns = DICTIONARIES_COLUMNS;
    columnsItems: DisplayDictionariesColumnsIteratorItem[] = [];
    selectedColumnsItems: DisplayDictionariesColumnsIteratorItem[] = [];
    columnsControl = new FormControl();
    dictionaries: DictionarySummary[];
    dataSource: MatTableDataSource<DictionarySummary> = new MatTableDataSource(new Array());
    state: DictionariesState = DictionariesState.Loading;
    error: string | undefined = undefined;
    isDownloadLoading: boolean;
    isWaitingForServerResponse: boolean;

    private serviceDestroyed$: Subject<boolean> = new Subject();
    constructor(public dialog: MatDialog, private dictionariesService: DictionariesService, private snackBar: MatSnackBar) {
        this.dataSource.sortingDataAccessor = this.sortDictionaries;
        this.columnsItems = this.getColumnIterator();
        this.selectedColumnsItems = this.getSelectedColumns();
        this.columnsControl.setValue(this.selectedColumnsItems);
        this.dictionariesService.subscribeToDictionariesUpdateMessageEvent(this.serviceDestroyed$, () => {
            this.convertDictionariesToMatDataSource(this.dictionariesService.getDictionaries());
        });
        this.dictionariesService.subscribeToDictionariestUpdateDataEvent(this.serviceDestroyed$, () => {
            this.convertDictionariesToMatDataSource(this.dictionariesService.getDictionaries());
            this.isWaitingForServerResponse = false;
        });
        this.dictionariesService.subscribeToDownloadLoadingEvent(this.serviceDestroyed$, () => {
            this.isDownloadLoading = false;
            this.isWaitingForServerResponse = false;
        });
        this.dictionariesService.subscribeToComponentUpdateEvent(this.serviceDestroyed$, (response) => {
            this.snackBar.open(
                response,
                'OK',
                Object.values(PositiveFeedback).includes(response as PositiveFeedback)
                    ? { duration: SNACK_BAR_SUCCESS_DURATION, panelClass: ['success'] }
                    : { duration: SNACK_BAR_ERROR_DURATION, panelClass: ['error'] },
            );
        });
        this.dictionariesService.subscribeToUpdatingDictionariesEvent(this.serviceDestroyed$, (state) => {
            this.state = state;
            this.isWaitingForServerResponse = false;
        });
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    ngOnInit(): void {
        this.setDictionariesData();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    modifyDictionary(element: DictionarySummary): void {
        const elementData: DictionaryDialogParameters = {
            title: element.title,
            dictionarytoModifyDescription: element.description,
            dictionaryToModifyName: element.title,
            dictionaryId: element.id,
        };
        this.dialog.open(ModifyDictionaryComponent, { data: elementData });
    }

    uploadDictionary(): void {
        this.dialog.open(UploadDictionaryComponent);
    }

    deleteDictionary(element: DictionarySummary): void {
        const elementId: DeleteDictionaryDialogParameters = {
            title: element.title,
            dictionaryId: element.id,
            onClose: () => {
                this.isWaitingForServerResponse = true;
            },
        };
        this.dialog.open(DeleteDictionaryDialogComponent, { data: elementId });
    }

    async setDictionariesData(): Promise<void> {
        await this.dictionariesService.updateAllDictionaries();
    }

    async downloadDictionary(id: string): Promise<void> {
        this.isDownloadLoading = true;
        await this.dictionariesService.downloadDictionary(id);
    }

    async resetDictionaries() {
        await this.dictionariesService.deleteAllDictionaries();
    }

    sortDictionaries(item: DictionarySummary, property: string): string | number {
        switch (property) {
            case 'dictionaryName':
                return item.title;
            case 'dictionaryDescription':
                return item.description;
            default:
                return isKey(property, item) ? (item[property] as string) : '';
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

    private async convertDictionariesToMatDataSource(dictionaries: DictionarySummary[]) {
        const dictionariesSummary: DictionarySummary[] = [];
        dictionaries.forEach((dictionary) => {
            dictionariesSummary.push({
                id: dictionary.id,
                title: dictionary.title,
                description: dictionary.description,
                isDefault: dictionary.isDefault,
            });
        });
        this.dataSource = new MatTableDataSource(dictionariesSummary);
    }
}
