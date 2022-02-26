import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LobbyInfo } from '@app/classes/communication/';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import {
    DIALOG_BUTTON_CONTENT_RETURN_LOBBY,
    DIALOG_CANCELED_CONTENT,
    DIALOG_CANCELED_TITLE,
    DIALOG_FULL_CONTENT,
    DIALOG_FULL_TITLE,
} from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services/';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent implements OnInit, OnDestroy {
    @ViewChild(NameFieldComponent) nameField: NameFieldComponent;

    nameValid: boolean;
    lobbiesUpdateSubscription: Subscription;
    lobbyFullSubscription: Subscription;
    lobbyCanceledSubscription: Subscription;
    componentDestroyed$: Subject<boolean> = new Subject();
    lobbies: LobbyInfo[];

    filterFormGroup: FormGroup = new FormGroup({
        gameType: new FormControl('all'),
    });
    numberOfLobbiesMeetingFilter: number = 0;

    constructor(
        private ref: ChangeDetectorRef,
        public gameDispatcherService: GameDispatcherService,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
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
        this.filterFormGroup.get('gameType')?.valueChanges.pipe(takeUntil(this.componentDestroyed$)).subscribe(this.validateName.bind(this));

        this.validateName();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    validateName(): void {
        this.numberOfLobbiesMeetingFilter = 0;
        this.nameValid = (this.nameField.formParameters?.get('inputName')?.valid as boolean) ?? false;

        for (const lobby of this.lobbies) {
            this.updateLobbyAttributes(lobby);
            if (lobby.meetFilters) this.numberOfLobbiesMeetingFilter++;
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

    joinRandomLobby() {
        try {
            const lobby = this.getRandomLobby();
            return this.joinLobby(lobby.lobbyId);
        } catch (e) {
            this.snackBar.open((e as Error).toString(), 'Ok', {
                duration: 3000,
            });
        }
    }

    getRandomLobby() {
        const filteredLobbies = this.lobbies.filter((lobby) => lobby.canJoin && lobby.meetFilters !== false);
        if (filteredLobbies.length === 0) throw new Error('Aucun lobby peut être rejoint.');
        return filteredLobbies[Math.floor(Math.random() * filteredLobbies.length)];
    }

    updateLobbyAttributes(lobby: LobbyInfo) {
        const gameType = this.filterFormGroup.get('gameType')?.value;
        lobby.meetFilters = gameType === 'all' || gameType === lobby.gameType;
        lobby.canJoin = this.nameValid && this.nameField.formParameters.get('inputName')?.value !== lobby.playerName;
    }
}
