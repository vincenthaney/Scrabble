import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ASCENDING, VIRTUAL_PLAYERS_COLUMNS } from '@app/constants/components-constants';
import { Subject } from 'rxjs';
import { VirtualPlayerProfile } from '@app/classes/admin/virtual-player-profile';
import {
    DeleteVirtualPlayerDialogParameters,
    DisplayVirtualPlayersColumns,
    DisplayVirtualPlayersColumnsIteratorItem,
    DisplayVirtualPlayersKeys,
    UpdateVirtualPlayersDialogParameters,
    VirtualPlayersComponentState,
} from './admin-virtual-players.types';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profiles.service';
import { CreateVirtualPlayerComponent } from '@app/components/create-virtual-player-dialog/create-virtual-player-dialog.component';
import { DeleteVirtualPlayerDialogComponent } from '@app/components/delete-virtual-player-dialog/delete-virtual-player-dialog.component';
import { UpdateVirtualPlayerComponent } from '@app/components/update-virtual-player-dialog/update-virtual-player-dialog.component';
import { PositiveFeedback } from '@app/constants/virtual-players-components';
import {
    CREATE_VIRTUAL_PLAYER_DIALOG_HEIGHT,
    CREATE_VIRTUAL_PLAYER_DIALOG_WIDTH,
    PositiveFeedbackResponse,
    UPDATE_VIRTUAL_PLAYER_DIALOG_HEIGHT,
    UPDATE_VIRTUAL_PLAYER_DIALOG_WIDTH,
} from '@app/constants/dialogs-constants';
import { SNACK_BAR_ERROR_DURATION, SNACK_BAR_SUCCESS_DURATION } from '@app/constants/dictionaries-components';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-admin-virtual-players',
    templateUrl: './admin-virtual-players.component.html',
    styleUrls: ['./admin-virtual-players.component.scss'],
})
export class AdminVirtualPlayersComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    columns: DisplayVirtualPlayersColumns;
    columnsItems: DisplayVirtualPlayersColumnsIteratorItem[];
    columnsControl: FormControl;
    virtualPlayers: VirtualPlayerProfile[];
    dataSource: MatTableDataSource<VirtualPlayerProfile>;
    state: VirtualPlayersComponentState;
    error: string | undefined;
    isWaitingForServerResponse: boolean;
    private componentDestroyed$: Subject<boolean>;
    constructor(public dialog: MatDialog, private virtualPlayerProfilesService: VirtualPlayerProfilesService, private snackBar: MatSnackBar) {
        this.componentDestroyed$ = new Subject();
        this.columns = VIRTUAL_PLAYERS_COLUMNS;
        this.columnsItems = this.getColumnIterator();
        this.dataSource = new MatTableDataSource(new Array());
        this.state = VirtualPlayersComponentState.Loading;
        this.error = undefined;

        this.initializeSubscriptions();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    ngOnInit(): void {
        this.virtualPlayerProfilesService.getAllVirtualPlayersProfile();
    }

    ngAfterViewInit(): void {
        this.sort.sort({ id: 'level', start: ASCENDING } as MatSortable);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    updateVirtualPlayer(virtualPlayerProfile: VirtualPlayerProfile): void {
        const virtualPlayerData: UpdateVirtualPlayersDialogParameters = {
            name: virtualPlayerProfile.name,
            level: virtualPlayerProfile.level,
            id: virtualPlayerProfile.id,
        };
        this.dialog.open(UpdateVirtualPlayerComponent, {
            data: virtualPlayerData,
            height: UPDATE_VIRTUAL_PLAYER_DIALOG_HEIGHT,
            width: UPDATE_VIRTUAL_PLAYER_DIALOG_WIDTH,
        });
    }

    createVirtualPlayer(): void {
        this.dialog.open(CreateVirtualPlayerComponent, {
            height: CREATE_VIRTUAL_PLAYER_DIALOG_HEIGHT,
            width: CREATE_VIRTUAL_PLAYER_DIALOG_WIDTH,
        });
    }

    deleteVirtualPlayer(virtualPlayerProfile: VirtualPlayerProfile): void {
        this.dialog.open(DeleteVirtualPlayerDialogComponent, {
            data: {
                name: virtualPlayerProfile.name,
                level: virtualPlayerProfile.level,
                id: virtualPlayerProfile.id,
                onClose: () => {
                    this.isWaitingForServerResponse = true;
                },
            } as DeleteVirtualPlayerDialogParameters,
        });
    }

    async resetVirtualPlayers(): Promise<void> {
        await this.virtualPlayerProfilesService.resetVirtualPlayerProfiles();
    }

    getColumnIterator(): DisplayVirtualPlayersColumnsIteratorItem[] {
        return Object.keys(this.columns).map<DisplayVirtualPlayersColumnsIteratorItem>((key) => ({
            key: key as DisplayVirtualPlayersKeys,
            label: this.columns[key as DisplayVirtualPlayersKeys],
        }));
    }

    getDisplayedColumns(): DisplayVirtualPlayersKeys[] {
        return this.columnsItems.map(({ key }) => key);
    }

    private convertVirtualPlayerProfilesToMatDataSource(virtualPlayerProfiles: VirtualPlayerProfile[]): void {
        this.dataSource.data = virtualPlayerProfiles;
    }

    private initializeSubscriptions(): void {
        this.virtualPlayerProfilesService.subscribeToVirtualPlayerProfilesUpdateEvent(this.componentDestroyed$, (profiles) => {
            this.convertVirtualPlayerProfilesToMatDataSource(profiles);
            this.state = VirtualPlayersComponentState.Ready;
            this.isWaitingForServerResponse = false;
        });

        this.virtualPlayerProfilesService.subscribeToRequestSentEvent(this.componentDestroyed$, () => {
            this.isWaitingForServerResponse = true;
        });

        this.virtualPlayerProfilesService.subscribeToComponentUpdateEvent(this.componentDestroyed$, (response) => {
            this.snackBar.open(response, 'OK', this.isFeedbackPositive(response as PositiveFeedback));
        });
    }

    private isFeedbackPositive(response: PositiveFeedback): PositiveFeedbackResponse {
        return Object.values(PositiveFeedback).includes(response as PositiveFeedback)
            ? { duration: SNACK_BAR_SUCCESS_DURATION, panelClass: ['success'] }
            : { duration: SNACK_BAR_ERROR_DURATION, panelClass: ['error'] };
    }
}
