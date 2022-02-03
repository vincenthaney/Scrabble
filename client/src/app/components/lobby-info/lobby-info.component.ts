import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
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
    // dictionnaries: Dictionnaries[]

    constructor(private router: Router) {
        this.lobby = { lobbyID: 0, playerName: '', gameType: GameType.Classic, timer: 0, canJoin: false };
    }

    async joinLobby() {
        await this.router.navigateByUrl('waiting');
    }

    convertTime(): string {
        return convertTime(this.lobby.timer);
    }
}
