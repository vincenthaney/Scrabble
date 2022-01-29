import { Component, ViewChild } from '@angular/core';
import { GameType } from '@app/classes/game-type';
import { LobbyInfo } from '@app/classes/lobby-info';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent {
    @ViewChild(NameFieldComponent) nameField: NameFieldComponent;

    isInputNameValid: boolean;
    // TODO: Receive LobbyInfo from server
    lobbies: LobbyInfo[] = [
        { lobbyID: 1, playerName: 'Nom1', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 2, playerName: 'Nom2', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 3, playerName: 'Nom3', gameType: GameType.LOG2990, timer: 90, canJoin: false },
        { lobbyID: 4, playerName: 'Nom4', gameType: GameType.Classic, timer: 300, canJoin: false },
        { lobbyID: 5, playerName: 'Nom5', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 6, playerName: 'Nom6', gameType: GameType.LOG2990, timer: 60, canJoin: false },
        { lobbyID: 7, playerName: 'Nom7', gameType: GameType.LOG2990, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
    ];

    validateName(): void {
        for (const lobby of this.lobbies) {
            lobby.canJoin = this.isInputNameValid && this.nameField.formParameters.get('inputName')?.value !== lobby.playerName;
        }
    }

    onNameChange(isInputNameValid: boolean) {
        this.isInputNameValid = isInputNameValid;
        this.validateName();
    }
}
