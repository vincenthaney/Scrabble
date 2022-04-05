import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DisplayGameHistoryColumnsIteratorItem, DisplayGameHistoryKeys, GameHistoryState } from '@app/classes/admin-game-history';
import { GameHistory } from '@app/classes/game-history/game-history';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { GAME_HISTORY_COLUMNS, DEFAULT_GAME_HISTORY_COLUMNS } from '@app/constants/components-constants';
import { isKey } from '@app/utils/is-key';

@Component({
    selector: 'app-admin-game-history',
    templateUrl: './admin-game-history.component.html',
    styleUrls: ['./admin-game-history.component.scss'],
})
export class AdminGameHistoryComponent implements OnInit, AfterViewInit {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    columns;
    columnsItems: DisplayGameHistoryColumnsIteratorItem[];
    selectedColumnsItems: DisplayGameHistoryColumnsIteratorItem[];
    columnsControl: FormControl;
    dataSource: MatTableDataSource<GameHistory>;
    state: GameHistoryState;
    error: string | undefined;

    constructor() {
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
        this.setHistoryData()
            .then(() => (this.state = GameHistoryState.Ready))
            .catch((error) => {
                this.error = error.toString();
                this.state = GameHistoryState.Error;
            });
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    resetHistory() {
        // call service
        this.dataSource.data = [];
    }

    async setHistoryData() {
        // call service
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                this.dataSource.data = this.getRandomData();
                resolve();
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 1000);
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
            default:
                return isKey(property, item) ? (item[property] as string) : '';
        }
    }

    getRandomData(): GameHistory[] {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return new Array(35).fill({}).map<GameHistory>(() => {
            const startTime = new Date();
            const endTime = new Date();

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            startTime.setHours(Math.random() * 24);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            startTime.setMinutes(Math.random() * 60);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            endTime.setHours(Math.random() * 24);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            endTime.setMinutes(Math.random() * 60);

            const player1Wins = Math.floor(Math.random() * 2) === 0;

            return {
                startTime,
                endTime,
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                player1Data: { name: 'Player 1', score: Math.floor(Math.random() * 300), isVirtualPlayer: false, isWinner: player1Wins },
                player2Data: {
                    name: 'Player 2',
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    score: Math.floor(Math.random() * 300),
                    isVirtualPlayer: Math.floor(Math.random() * 2) === 0,
                    isWinner: !player1Wins,
                },
                gameType: Math.floor(Math.random() * 2) === 0 ? GameType.LOG2990 : GameType.Classic,
                gameMode: Math.floor(Math.random() * 2) === 0 ? GameMode.Solo : GameMode.Multiplayer,
                isOver: Math.floor(Math.random() * 2) === 0,
                hasBeenAbandoned: Math.floor(Math.random() * 2) === 0,
            };
        });
    }
}
