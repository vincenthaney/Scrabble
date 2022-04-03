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
import { DICTIONARIES_ADDED } from '@app/constants/dictionary-service-constants';
import { Subject } from 'rxjs';

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
    dataSource: MatTableDataSource<DictionarySummary> = new MatTableDataSource(new Array());
    state: DictionariesState = DictionariesState.Loading;
    error: string | undefined = undefined;
    displayPopupDictionary = false;

    // Variable to store shortLink from api response
    shortLink: string = '';
    loading: boolean = false; // Flag variable
    file: File; // Variable to store file

    private serviceDestroyed$: Subject<boolean> = new Subject();
    constructor(public dialog: MatDialog, private dictionariesService: DictionariesService) {
        this.dataSource.sortingDataAccessor = this.sortDictionaries;
        this.columnsItems = this.getColumnIterator();
        this.selectedColumnsItems = this.getSelectedColumns();
        this.columnsControl.setValue(this.selectedColumnsItems);
        this.dictionariesService.subscribeToDictionariesDataUpdateEvent(this.serviceDestroyed$, (dictionaries) => {
            // vérifier que le component s'actualise avec son contenu en live. sinon, il faudrait lui faire un event d'update
            this.convertDictionariesToMatDataSource(dictionaries);
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

    resetDictionaries() {
        this.dataSource.data = [];
    }

    modifyDictionary(element: DictionarySummary): void {
        this.displayPopupDictionary = true;
        const elementData: DictionaryDialogParameters = {
            title: element.title,
            dictionarytoModifyDescription: element.description,
            dictionaryToModifyName: element.title,
            dictionaryId: element.id,
        };
        this.dialog.open(ModifyDictionaryComponent, { data: elementData });
    }

    async setDictionariesData(): Promise<string | void> {
        const response = await this.dictionariesService.getDictionaries();
        if (response === DICTIONARIES_ADDED) {
            this.convertDictionariesToMatDataSource(this.dictionariesService.dictionaries);
        }
        return response;
    }

    async downloadDictionary(id: string): Promise<void> {
        this.dictionariesService.downloadDictionary(id);
    }

    async deleteDictionary(id: string): Promise<void> {
        this.dictionariesService.deleteDictionary(id);
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

    isDefault(dictionarySummary: DictionarySummary): boolean {
        return dictionarySummary.isDefault ? true : false;
    }

    private convertDictionariesToMatDataSource(dictionaries: DictionarySummary[]) {
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
