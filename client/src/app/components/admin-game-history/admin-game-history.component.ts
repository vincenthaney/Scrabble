import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
    DisplayGameHistoryColumns,
    DisplayGameHistoryColumnsIteratorItem,
    DisplayGameHistoryKeys,
    GameHistoryState,
} from '@app/classes/admin-game-history';
import { GameHistoriesConverter } from '@app/classes/game-history/game-histories-converter';
import { GameHistory } from '@app/classes/game-history/game-history';
import { GAME_HISTORY_COLUMNS, DEFAULT_GAME_HISTORY_COLUMNS } from '@app/constants/components-constants';
import { GameHistoryController } from '@app/controllers/game-history-controller/game-history.controller';
import { isKey } from '@app/utils/is-key';
import { catchError, retry } from 'rxjs/operators';

@Component({
    selector: 'app-admin-game-history',
    templateUrl: './admin-game-history.component.html',
    styleUrls: ['./admin-game-history.component.scss'],
})
export class AdminGameHistoryComponent implements OnInit, AfterViewInit {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    columns: DisplayGameHistoryColumns;
    columnsItems: DisplayGameHistoryColumnsIteratorItem[];
    selectedColumnsItems: DisplayGameHistoryColumnsIteratorItem[];
    columnsControl: FormControl;
    dataSource: MatTableDataSource<GameHistory>;
    state: GameHistoryState;
    error: string | undefined;

    constructor(private readonly gameHistoryController: GameHistoryController, private readonly snackBar: MatSnackBar) {
        this.columns = GAME_HISTORY_COLUMNS;
        this.columnsItems = this.getColumnIterator();
        this.selectedColumnsItems = this.getSelectedColumns();
        this.columnsControl = new FormControl();
        this.dataSource = new MatTableDataSource(new Array());
        this.state = GameHistoryState.Loading;
        this.error = undefined;

        this.dataSource.sortingDataAccessor = this.sortGameHistory;
        this.columnsControl.setValue(this.selectedColumnsItems);
    }

    ngOnInit(): void {
        this.updateHistoryData();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    resetHistory() {
        this.state = GameHistoryState.Loading;
        this.gameHistoryController
            .resetGameHistories()
            .pipe(
                retry(1),
                catchError((error, caught) => {
                    this.state = GameHistoryState.Ready;
                    this.snackBar.open(error);
                    return caught;
                }),
            )
            .subscribe(() => {
                this.dataSource.data = [];
                this.state = GameHistoryState.Ready;
            });
    }

    updateHistoryData() {
        this.state = GameHistoryState.Loading;
        this.setHistoryData()
            .then(() => (this.state = GameHistoryState.Ready))
            .catch((error) => {
                this.error = error.toString();
                this.state = GameHistoryState.Error;
            });
    }

    async setHistoryData() {
        return new Promise<void>((resolve, reject) => {
            this.gameHistoryController
                .getGameHistories()
                .pipe(
                    retry(1),
                    catchError((error, caught) => {
                        reject(error);
                        return caught;
                    }),
                )
                .subscribe((gameHistories) => {
                    this.dataSource.data = GameHistoriesConverter.convert(gameHistories);
                    resolve();
                });
        });
    }

    getColumnIterator(): DisplayGameHistoryColumnsIteratorItem[] {
        return Object.keys(this.columns).map<DisplayGameHistoryColumnsIteratorItem>((key) => ({
            key: key as DisplayGameHistoryKeys,
            label: this.columns[key as DisplayGameHistoryKeys],
        }));
    }

    getDisplayedColumns(): DisplayGameHistoryKeys[] {
        return this.selectedColumnsItems.map(({ key }) => key);
    }

    getSelectedColumns(): DisplayGameHistoryColumnsIteratorItem[] {
        return DEFAULT_GAME_HISTORY_COLUMNS.map<DisplayGameHistoryColumnsIteratorItem>(
            (key) => this.columnsItems.find((item) => item.key === key) || { key, label: this.columns[key] },
        );
    }

    sortGameHistory(item: GameHistory, property: string): string | number {
        switch (property) {
            case 'player1Name':
                return item.player1Data.name;
            case 'player1Score':
                return item.player1Data.score;
            case 'player1Data':
                return item.player1Data.name;
            case 'player2Name':
                return item.player2Data.name;
            case 'player2Score':
                return item.player2Data.score;
            case 'player2Data':
                return item.player2Data.name;
            case 'startDate':
                return item.startTime.valueOf();
            case 'endDate':
                return item.endTime.valueOf();
            default:
                return isKey(property, item) ? (item[property] as string) : '';
        }
    }

    getDuration(item: GameHistory): number {
        return item.endTime.getTime() - item.startTime.getTime();
    }
}
