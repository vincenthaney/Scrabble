import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LobbyInfo } from '@app/classes/communication/lobby-info';
import { GameType } from '@app/classes/game-type';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DIALOG_TITLE, DIALOG_BUTTON_CONTENT, DIALOG_CONTENT_PART_1, DIALOG_CONTENT_PART_2 } from './lobby-page.component.const';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent implements OnInit, OnDestroy {
    @ViewChild(NameFieldComponent) nameField: NameFieldComponent;

    lobbiesUpdateSubscription: Subscription;
    lobbyFullSubscription: Subscription;
    componentDestroyed$: Subject<boolean> = new Subject();
    // TODO: Receive LobbyInfo from server
    lobbies: LobbyInfo[] = [
        {
            lobbyId: '1',
            dictionary: '',
            playerName: 'Nom vraiment long',
            gameType: GameType.Classic,
            maxRoundTime: 270,
            canJoin: false,
        },
        { lobbyId: '1', dictionary: '', playerName: 'Nom1', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '2', dictionary: '', playerName: 'Moyen Long', gameType: GameType.Classic, maxRoundTime: 150, canJoin: false },
        { lobbyId: '3', dictionary: '', playerName: 'aa', gameType: GameType.LOG2990, maxRoundTime: 90, canJoin: false },
    ];
    constructor(
        private ref: ChangeDetectorRef,
        public gameDispatcherService: GameDispatcherService,
        public dialog: MatDialog,
        private router: Router,
    ) {}

    ngOnInit() {
        this.lobbiesUpdateSubscription = this.gameDispatcherService.lobbiesUpdateEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((lobbies) => this.updateLobbies(lobbies));
        this.lobbyFullSubscription = this.gameDispatcherService.lobbyFullEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((opponentName) => this.lobbyFullDialog(opponentName));
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
        this.router.navigateByUrl('join-waiting');
        this.gameDispatcherService.handleJoinLobby(
            this.lobbies.filter((lobby) => lobby.lobbyId === lobbyId)[0],
            this.nameField.formParameters.get('inputName')?.value,
        );
    }

    lobbyFullDialog(opponentName: string) {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_TITLE,
                content: DIALOG_CONTENT_PART_1 + opponentName + DIALOG_CONTENT_PART_2,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT,
                        closeDialog: true,
                    },
                ],
            },
        });
    }
}
