import { Component, Input } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { GameType } from '@app/classes/game-type';
import { LobbyInfo } from '@app/classes/lobby-info';
import { VERSUS_ICON, GAME_TYPE_ICON } from './lobby-info-icons';

@Component({
    selector: 'app-lobby-info',
    templateUrl: './lobby-info.component.html',
    styleUrls: ['./lobby-info.component.scss'],
})
export class LobbyInfoComponent {
    @Input() lobby: LobbyInfo;
    // dictionnaries: Dictionnaries[]

    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private router: Router) {
        iconRegistry.addSvgIcon('dictionary', 'static/dictionary-icon.svg');
        iconRegistry.addSvgIconLiteral('versus', sanitizer.bypassSecurityTrustHtml(VERSUS_ICON));
        iconRegistry.addSvgIconLiteral('game-type', sanitizer.bypassSecurityTrustHtml(GAME_TYPE_ICON));
        this.lobby = { lobbyID: 0, playerName: '', gameType: GameType.Classic, timer: 0, canJoin: false };
    }

    async joinLobby() {
        await this.router.navigateByUrl('waiting');
    }
}
