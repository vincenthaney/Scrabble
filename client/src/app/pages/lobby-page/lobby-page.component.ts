import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LobbyData } from '@app/classes/communication/lobby-data';
import { LobbyInfo } from '@app/classes/communication/lobby-info';
import { GameType } from '@app/classes/game-type';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { Subscription } from 'rxjs';
import { DIALOG_TITLE, DIALOG_BUTTON_CONTENT, DIALOG_CONTENT_PART_1, DIALOG_CONTENT_PART_2 } from './lobby-page.components.const';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent implements OnInit, OnDestroy {
    @ViewChild(NameFieldComponent) nameField: NameFieldComponent;

    lobbyUpdateSubscription: Subscription;
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
        { lobbyId: '5', dictionary: '', playerName: 'Nom5', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '6', dictionary: '', playerName: 'Nom6', gameType: GameType.LOG2990, maxRoundTime: 60, canJoin: false },
        { lobbyId: '7', dictionary: '', playerName: 'Nom7', gameType: GameType.LOG2990, maxRoundTime: 60, canJoin: false },
        { lobbyId: '8', dictionary: '', playerName: 'Nom8', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '9', dictionary: '', playerName: 'Nom9', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '10', dictionary: '', playerName: 'Nom10', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '11', dictionary: '', playerName: 'Nom11', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '12', dictionary: '', playerName: 'Nom12', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '13', dictionary: '', playerName: 'Nom13', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '14', dictionary: '', playerName: 'Nom14', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '15', dictionary: '', playerName: 'Nom15', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '16', dictionary: '', playerName: 'Nom16', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '17', dictionary: '', playerName: 'Nom17', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
        { lobbyId: '18', dictionary: '', playerName: 'Nom18', gameType: GameType.Classic, maxRoundTime: 60, canJoin: false },
    ];
    constructor(private ref: ChangeDetectorRef, public gameDispatcherService: GameDispatcherService, public dialog: MatDialog) {}

    ngOnInit() {
        this.lobbyUpdateSubscription = this.gameDispatcherService.lobbyUpdateEvent.subscribe((lobbies) => this.updateLobbies(lobbies));
        this.lobbyFullSubscription = this.gameDispatcherService.lobbyFullEvent.subscribe((opponentName) => this.lobbyFullDialog(opponentName));
    }

    ngOnDestroy() {
        if (this.lobbyUpdateSubscription) {
            this.lobbyUpdateSubscription.unsubscribe();
        }
        if (this.lobbyFullSubscription) {
            this.lobbyFullSubscription.unsubscribe();
        }
    }

    joinLobby(lobbyId: string) {
        if (lobbyId) {
            this.gameDispatcherService.handleJoinLobby(lobbyId, this.nameField.formParameters.get('inputName')?.value);
        }
    }

    validateName(): void {
        for (const lobby of this.lobbies) {
            lobby.canJoin =
                (this.nameField.formParameters.get('inputName')?.valid ? true : false) &&
                this.nameField.formParameters.get('inputName')?.value !== lobby.playerName;
        }
    }

    updateLobbies(lobbies: LobbyData[]): void {
        this.lobbies = lobbies;
        this.validateName();
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

    onNameChange() {
        this.validateName();
        this.ref.markForCheck();
    }
}
