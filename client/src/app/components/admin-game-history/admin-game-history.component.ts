import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { GameHistory } from '@app/classes/game-history/game-history';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';

export type DisplayGameHistoryKeys = keyof GameHistory | 'player1Name' | 'player1Score' | 'player2Name' | 'player2Score';
export type DisplayGameHistoryColumns = {
    [Property in DisplayGameHistoryKeys]: string;
};
export type DisplayGameHistoryColumnsIteratorItem = { key: DisplayGameHistoryKeys; label: string };

const COLUMNS: DisplayGameHistoryColumns = {
    startTime: 'Date de début',
    endTime: 'Date de fin',
    isOver: 'Partie terminée',
    hasBeenAbandoned: 'Partie abandonnée',
    gameType: 'Type de jeu',
    gameMode: 'Mode de jeu',
    player1Data: 'Joueur 1',
    player1Name: 'Nom joueur 1',
    player1Score: 'Points joueur 1',
    player2Data: 'Joueur 2',
    player2Name: 'Nom joueur 2',
    player2Score: 'Points joueur 2',
    replacingPlayer: 'Joueur de remplacement',
};

const DEFAULT_COLUMNS: DisplayGameHistoryKeys[] = [
    'startTime',
    'isOver',
    'gameType',
    'gameMode',
    'player1Name',
    'player1Score',
    'player2Name',
    'player2Score',
];

@Component({
    selector: 'app-admin-game-history',
    templateUrl: './admin-game-history.component.html',
    styleUrls: ['./admin-game-history.component.scss'],
})
export class AdminGameHistoryComponent implements AfterViewInit {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    columns = COLUMNS;
    columnsItems: DisplayGameHistoryColumnsIteratorItem[];
    selectedColumnsItems: DisplayGameHistoryColumnsIteratorItem[] = [];
    columnsControl = new FormControl();
    dataSource: MatTableDataSource<GameHistory>;

    constructor() {
        this.dataSource = new MatTableDataSource(this.getRandomData());
        this.dataSource.sortingDataAccessor = (item, property) => {
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
                    return this.isObjKey(property, item) ? (item[property] as string) : '';
            }
        };

        this.columnsItems = this.getColumnIterator();
        this.selectedColumnsItems = DEFAULT_COLUMNS.map<DisplayGameHistoryColumnsIteratorItem>(
            (key) => this.columnsItems.find((item) => item.key === key) || { key, label: this.columns[key] },
        );
        this.columnsControl.setValue(this.selectedColumnsItems);
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    isObjKey<T>(key: PropertyKey, obj: T): key is keyof T {
        return key in obj;
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

            return {
                startTime,
                endTime,
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                player1Data: { name: 'Player 1', score: Math.floor(Math.random() * 300), isVirtualPlayer: false },
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                player2Data: { name: 'Player 2', score: Math.floor(Math.random() * 300), isVirtualPlayer: Math.floor(Math.random() * 2) === 0 },
                gameType: Math.floor(Math.random() * 2) === 0 ? GameType.LOG2990 : GameType.Classic,
                gameMode: Math.floor(Math.random() * 2) === 0 ? GameMode.Solo : GameMode.Multiplayer,
                isOver: Math.floor(Math.random() * 2) === 0,
                hasBeenAbandoned: Math.floor(Math.random() * 2) === 0,
            };
        });
    }
}
