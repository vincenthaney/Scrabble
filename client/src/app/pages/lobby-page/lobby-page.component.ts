import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LobbyInfo } from '@app/classes/communication/';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import {
    DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
    DIALOG_CANCELED_CONTENT,
    DIALOG_CANCELED_TITLE,
    DIALOG_FULL_CONTENT,
    DIALOG_FULL_TITLE
} from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent implements OnInit, OnDestroy {
    @ViewChild(NameFieldComponent) nameField: NameFieldComponent;
    componentDestroyed$: Subject<boolean> = new Subject();
    lobbies: LobbyInfo[];
    constructor(private ref: ChangeDetectorRef, public gameDispatcherService: GameDispatcherService, public dialog: MatDialog) {}

    ngOnInit(): void {
        this.gameDispatcherService.subscribeToLobbiesUpdateEvent(this.componentDestroyed$, (lobbies) => this.updateLobbies(lobbies));
        this.gameDispatcherService.subscribeToLobbyFullEvent(this.componentDestroyed$, () => this.lobbyFullDialog());
        this.gameDispatcherService.subscribeToCanceledGameEvent(this.componentDestroyed$, () => this.lobbyCanceledDialog());
        this.gameDispatcherService.handleLobbyListRequest();
    }

    ngOnDestroy(): void {
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

    onNameChange(): void {
        this.validateName();
        this.ref.markForCheck();
    }

    updateLobbies(lobbies: LobbyInfo[]): void {
        this.lobbies = lobbies;
        this.validateName();
    }

    joinLobby(lobbyId: string): void {
        this.gameDispatcherService.handleJoinLobby(
            this.lobbies.filter((lobby) => lobby.lobbyId === lobbyId)[0],
            this.nameField.formParameters.get('inputName')?.value,
        );
    }

    lobbyFullDialog(): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_FULL_TITLE,
                content: DIALOG_FULL_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    lobbyCanceledDialog(): void {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_CANCELED_TITLE,
                content: DIALOG_CANCELED_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
                        closeDialog: true,
                    },
                ],
            },
        });
    }
}
