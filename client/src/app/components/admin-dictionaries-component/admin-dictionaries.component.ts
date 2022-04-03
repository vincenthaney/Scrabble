import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { Dictionary } from '@app/classes/dictionary';

@Component({
    selector: 'app-admin-dictionaries',
    templateUrl: './admin-dictionaries.component.html',
    styleUrls: ['./admin-dictionaries.component.scss'],
})
export class AdminDictionariesComponent implements OnInit, AfterViewInit {
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

    constructor(public dialog: MatDialog, private dictionariesService: DictionariesService) {
        this.dataSource.sortingDataAccessor = this.sortDictionaries;
        this.columnsItems = this.getColumnIterator();
        this.selectedColumnsItems = this.getSelectedColumns();
        this.columnsControl.setValue(this.selectedColumnsItems);
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

    // new Promise<void>((resolve) => {
    //     setTimeout(() => {
    //         // this.dataSource.data = this.dictionaryService.getDictionariesData();
    //         this.dataSource = new MatTableDataSource(this.getRandomData());
    //         resolve();
    //         // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    //     }, 1000);
    async setDictionariesData(): Promise<string | DictionarySummary[]> {
        const response = await this.dictionariesService.getDictionaries();
        if (response === DICTIONARIES_ADDED) {
            return this.convertDictionariesToSummary(this.dictionariesService.dictionaries);
        }
        return response;
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

    getRandomData(): DictionarySummary[] {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return new Array(35).fill({}).map<DictionarySummary>(() => {
            return {
                title: 'Multidictionnaire',
                description: 'Meilleur dictionnaire ever',
                id: '69420',
                isDefault: true,
            };
        });
    }

    isDefault(dictionarySummary: DictionarySummary): boolean {
        return dictionarySummary.isDefault ? true : false;
    }

    private convertDictionariesToSummary(dictionaries: Map<string, Dictionary>): DictionarySummary[] {
        const dictionariesSummary: DictionarySummary[] = [];
        dictionaries.forEach((dictionary: Dictionary, key: string) => {
            dictionariesSummary.push({
                id: key,
                title: dictionary.title,
                description: dictionary.description,
            });
        });
        return dictionariesSummary;
    }
}
