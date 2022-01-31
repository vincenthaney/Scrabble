import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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

    // TODO: Receive LobbyInfo from server
    lobbies: LobbyInfo[] = [
        { lobbyID: 1, playerName: 'Nom1', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 2, playerName: 'Moyen Long', gameType: GameType.Classic, timer: 150, canJoin: false },
        { lobbyID: 3, playerName: 'aa', gameType: GameType.LOG2990, timer: 90, canJoin: false },
        { lobbyID: 4, playerName: 'Nom vraiment long', gameType: GameType.Classic, timer: 270, canJoin: false },
        { lobbyID: 5, playerName: 'Nom5', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 6, playerName: 'Nom6', gameType: GameType.LOG2990, timer: 60, canJoin: false },
        { lobbyID: 7, playerName: 'Nom7', gameType: GameType.LOG2990, timer: 60, canJoin: false },
        { lobbyID: 8, playerName: 'Nom8', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 9, playerName: 'Nom9', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 10, playerName: 'Nom10', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 11, playerName: 'Nom11', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 12, playerName: 'Nom12', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 13, playerName: 'Nom13', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 14, playerName: 'Nom14', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 15, playerName: 'Nom15', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 16, playerName: 'Nom16', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 17, playerName: 'Nom17', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 18, playerName: 'Nom18', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 19, playerName: 'Nom19', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 20, playerName: 'Nom20', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 21, playerName: 'Nom21', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 22, playerName: 'Nom22', gameType: GameType.Classic, timer: 60, canJoin: false },
        { lobbyID: 23, playerName: 'Nom23', gameType: GameType.Classic, timer: 60, canJoin: false },
    ];
    constructor(private ref: ChangeDetectorRef) {}
    validateName(): void {
        for (const lobby of this.lobbies) {
            lobby.canJoin =
                (this.nameField.formParameters.get('inputName')?.valid ? true : false) &&
                this.nameField.formParameters.get('inputName')?.value !== lobby.playerName;
        }
    }

    onNameChange() {
        this.validateName();
        this.ref.markForCheck();
    }
}
