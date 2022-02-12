import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LobbyInfo } from '@app/classes/communication/';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { GameDispatcherService } from '@app/services/';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { lobbyPageConstants } from '@app/constants/pages-constants';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent implements OnInit, OnDestroy {
    @ViewChild(NameFieldComponent) nameField: NameFieldComponent;

    lobbiesUpdateSubscription: Subscription;
    lobbyFullSubscription: Subscription;
    lobbyCanceledSubscription: Subscription;
    componentDestroyed$: Subject<boolean> = new Subject();
    lobbies: LobbyInfo[];
    constructor(private ref: ChangeDetectorRef, public gameDispatcherService: GameDispatcherService, public dialog: MatDialog) {}

    ngOnInit() {
        this.lobbiesUpdateSubscription = this.gameDispatcherService.lobbiesUpdateEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((lobbies) => this.updateLobbies(lobbies));
        this.lobbyFullSubscription = this.gameDispatcherService.lobbyFullEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe(() => this.lobbyFullDialog());
        this.lobbyCanceledSubscription = this.gameDispatcherService.canceledGameEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe(() => this.lobbyCanceledDialog());
        this.gameDispatcherService.handleLobbyListRequest();
    }

    ngOnDestroy() {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    validateName(): void {
        for (const lobby of this.lobbies) {
            lobby.canJoin =
                (this.nameField.formParameters.get('inputName')?.valid as boolean) &&
                this.nameField.formParameters.get('inputName')?.value !== lobby.playerName;
        }
    }

    onNameChange() {
        this.validateName();
        this.ref.markForCheck();
    }

    updateLobbies(lobbies: LobbyInfo[]): void {
        this.lobbies = lobbies;
        this.validateName();
    }

    joinLobby(lobbyId: string) {
        this.gameDispatcherService.handleJoinLobby(
            this.lobbies.filter((lobby) => lobby.lobbyId === lobbyId)[0],
            this.nameField.formParameters.get('inputName')?.value,
        );
    }

    lobbyFullDialog() {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: lobbyPageConstants.DIALOG_FULL_TITLE,
                content: lobbyPageConstants.DIALOG_FULL_CONTENT,
                buttons: [
                    {
                        content: lobbyPageConstants.DIALOG_BUTTON_CONTENT,
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    lobbyCanceledDialog() {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: lobbyPageConstants.DIALOG_CANCELED_TITLE,
                content: lobbyPageConstants.DIALOG_CANCELED_CONTENT,
                buttons: [
                    {
                        content: lobbyPageConstants.DIALOG_BUTTON_CONTENT,
                        closeDialog: true,
                    },
                ],
            },
        });
    }
}
