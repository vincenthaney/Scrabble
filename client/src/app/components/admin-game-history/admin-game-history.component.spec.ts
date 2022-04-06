/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameHistoryState } from '@app/classes/admin-game-history';
import { GameHistory } from '@app/classes/game-history/game-history';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { GAME_HISTORY_COLUMNS, DEFAULT_GAME_HISTORY_COLUMNS } from '@app/constants/components-constants';

import { AdminGameHistoryComponent } from './admin-game-history.component';

describe('AdminGameHistoryComponent', () => {
    let component: AdminGameHistoryComponent;
    let fixture: ComponentFixture<AdminGameHistoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatSelectModule,
                MatDividerModule,
                MatOptionModule,
                MatProgressSpinnerModule,
                MatTooltipModule,
                MatPaginatorModule,
            ],
            declarations: [AdminGameHistoryComponent, MatSort, MatPaginator],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminGameHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        let setHistoryDataSpy: jasmine.Spy;

        beforeEach(() => {
            setHistoryDataSpy = spyOn(component, 'setHistoryData');
        });

        it('should set state to Ready', (done) => {
            setHistoryDataSpy.and.resolveTo();

            component.ngOnInit();

            setTimeout(() => {
                expect(component.state).toEqual(GameHistoryState.Ready);
                done();
            }, 2);
        });

        it('should set state to Error on reject', (done) => {
            const error = 'error';
            setHistoryDataSpy.and.rejectWith(error);

            component.ngOnInit();

            setTimeout(() => {
                expect(component.state).toEqual(GameHistoryState.Error);
                done();
            }, 2);
        });

        it('should set error on reject', (done) => {
            const error = 'error';
            setHistoryDataSpy.and.rejectWith(error);

            component.ngOnInit();

            setTimeout(() => {
                expect(component.error).toEqual(error);
                done();
            }, 2);
        });
    });

    describe('ngAfterViewInit', () => {
        beforeEach(() => {
            component.dataSource = new MatTableDataSource<GameHistory>();
        });

        it('should set dataSource sort', () => {
            const sort = new MatSort();
            component.sort = sort;

            component.ngAfterViewInit();

            expect(component.dataSource.sort).toEqual(sort);
        });

        it('should set dataSource paginator', () => {
            const intl = new MatPaginatorIntl();
            const paginator = new MatPaginator(intl, undefined as unknown as ChangeDetectorRef);
            component.paginator = paginator;

            component.ngAfterViewInit();

            expect(component.dataSource.paginator).toEqual(paginator);
        });
    });

    describe('getColumnIterator', () => {
        it('should convert columns object to array', () => {
            (component.columns as unknown) = { a: 'b', c: 'd' };
            const expected = [
                { key: 'a', label: 'b' },
                { key: 'c', label: 'd' },
            ];

            const result = component.getColumnIterator();

            expect(result as unknown).toEqual(expected);
        });
    });

    describe('getDisplayedColumns', () => {
        it('should get keys of selectedColumnsItems', () => {
            (component.selectedColumnsItems as unknown) = [
                { key: 'a', label: 'b' },
                { key: 'c', label: 'd' },
            ];
            const expected = ['a', 'c'];

            const result = component.getDisplayedColumns();

            expect(result as unknown).toEqual(expected);
        });
    });

    describe('getSelectedColumns', () => {
        it('should get columns from DEFAULT_COLUMNS', () => {
            const expected = DEFAULT_GAME_HISTORY_COLUMNS.map((key) => ({ key, label: GAME_HISTORY_COLUMNS[key] }));

            const result = component.getSelectedColumns();

            expect(expected).toEqual(result);
        });
    });

    describe('sortGameHistory', () => {
        let gameHistory: GameHistory;

        beforeEach(() => {
            gameHistory = {
                startTime: new Date(2022, 2, 28),
                endTime: new Date(2022, 2, 29),
                player1Data: {
                    name: 'player-1',
                    score: 1,
                    isVirtualPlayer: false,
                    isWinner: true,
                },
                player2Data: {
                    name: 'player-2',
                    score: 2,
                    isVirtualPlayer: true,
                    isWinner: false,
                },
                gameType: GameType.Classic,
                gameMode: GameMode.Multiplayer,
                hasBeenAbandoned: false,
            };
        });

        const tests: [property: string, element: string][] = [
            ['player1Name', 'player1Data.name'],
            ['player1Score', 'player1Data.score'],
            ['player1Data', 'player1Data.name'],
            ['player2Name', 'player2Data.name'],
            ['player2Score', 'player2Data.score'],
            ['player2Data', 'player2Data.name'],
            ['startTime', 'startTime'],
        ];

        for (const [property, element] of tests) {
            it(`should return ${element} for ${property}`, () => {
                let expected: any = gameHistory;
                const elements = element.split('.');

                let currentElement: any;
                while ((currentElement = elements.shift())) {
                    expected = expected[currentElement];
                }

                expect(component.sortGameHistory(gameHistory, property) as unknown).toEqual(expected);
            });
        }

        it('should return empty array if property does not exists', () => {
            expect(component.sortGameHistory(gameHistory, 'invalidProperty')).toEqual('');
        });
    });

    describe('getDuration', () => {
        const tests: [start: Date, end: Date, expected: number][] = [
            [new Date(1, 1, 1, 3, 30), new Date(1, 1, 1, 5, 45), 8100],
            [new Date(1, 1, 1, 5, 0), new Date(1, 1, 1, 16, 0), 39600],
        ];

        let index = 1;
        for (const [start, end, expected] of tests) {
            it(`should get duration (${index})`, () => {
                const item: GameHistory = { startTime: start, endTime: end } as GameHistory;
                expect(component.getDuration(item)).toEqual(expected);
            });
            index++;
        }
    });
});
