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
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';

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

    constructor(public dialog: MatDialog) {
        this.dataSource.sortingDataAccessor = this.sortDictionaries;
        this.columnsItems = this.getColumnIterator();
        this.selectedColumnsItems = this.getSelectedColumns();
        this.columnsControl.setValue(this.selectedColumnsItems);
    }

    ngOnInit(): void {
        this.setDictionariesData()
            .then(() => (this.state = DictionariesState.Ready))
            .catch((error) => {
                this.error = error.toString();
                this.state = DictionariesState.Error;
            });
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    resetDictionaries() {
        this.dataSource.data = [];
    }

    async setDictionariesData() {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                // this.dataSource.data = this.dictionaryService.getDictionariesData();
                this.dataSource = new MatTableDataSource(this.getRandomData());
                resolve();
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 1000);
        });
    }

    modifyDictionary(): void {
        const buttonsContent = ['Modify', 'Close'];
        this.openDialog('Modify Dictionary', 'test', buttonsContent);
        return;
    }

    async downloadDictionary(): Promise<void> {
        // this.dictionaryService.downloadDictionary();
        return;
    }

    async deleteDictionary(): Promise<void> {
        return;
    }

    openDialog(title: string, content: string, buttonsContent: string[]): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title,
                content,
                buttons: [
                    {
                        content: buttonsContent[0],
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                        // action: () => this.dictionaryService.modifyDictionary(),
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        action: () => {},
                        closeDialog: true,
                    },
                    {
                        content: buttonsContent[1],
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
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
}
