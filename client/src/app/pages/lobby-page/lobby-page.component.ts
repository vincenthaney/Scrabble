import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LobbyInfo } from '@app/classes/communication/lobby-info';
import { GameType } from '@app/classes/game-type';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { Subscription } from 'rxjs';
import { DIALOG_BUTTON_CONTENT, DIALOG_CONTENT_PART_1, DIALOG_CONTENT_PART_2, DIALOG_TITLE } from './lobby-page.component.const';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent implements OnInit, OnDestroy {
    @ViewChild(NameFieldComponent) nameField: NameFieldComponent;

    lobbiesUpdateSubscription: Subscription;
    lobbyFullSubscription: Subscription;

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
        this.lobbiesUpdateSubscription = this.gameDispatcherService.lobbiesUpdateEvent.subscribe((lobbies) => this.updateLobbies(lobbies));
        this.lobbyFullSubscription = this.gameDispatcherService.lobbyFullEvent.subscribe((opponentName) => this.lobbyFullDialog(opponentName));
        this.gameDispatcherService.handleLobbyListRequest();
    }

    ngOnDestroy() {
        if (this.lobbiesUpdateSubscription) {
            this.lobbiesUpdateSubscription.unsubscribe();
        }
        if (this.lobbyFullSubscription) {
            this.lobbyFullSubscription.unsubscribe();
        }
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
        this.gameDispatcherService.handleJoinLobby(lobbyId, this.nameField.formParameters.get('inputName')?.value);
    }

    lobbyFullDialog(opponentName: string) {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                // Data type is DefaultDialogParameters
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
