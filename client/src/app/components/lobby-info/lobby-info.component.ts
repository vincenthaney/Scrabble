import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LobbyInfo } from '@app/classes/communication/lobby-info';
import { GameType } from '@app/classes/game-type';
import { convertTime } from '@app/classes/utils';

@Component({
    selector: 'app-lobby-info',
    templateUrl: './lobby-info.component.html',
    styleUrls: ['./lobby-info.component.scss'],
})
export class LobbyInfoComponent {
    @Input() lobby: LobbyInfo;
    @Output() joinLobbyId = new EventEmitter<string>();
    // dictionnaries: Dictionnaries[]

    constructor() {
        this.lobby = { lobbyId: '0', dictionary: '', playerName: '', gameType: GameType.Classic, maxRoundTime: 0, canJoin: false };
    }

    joinLobby() {
        this.joinLobbyId.emit(this.lobby.lobbyId);
    }

    convertTime(): string {
        return convertTime(this.lobby.maxRoundTime);
    }
}
