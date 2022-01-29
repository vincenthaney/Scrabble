import { Component, Input } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { GameType } from '@app/classes/game-type';
import { LobbyInfo } from '@app/classes/lobby-info';

const VERSUS_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#222"' +
    ' d="M53.39,9.11H10.61a1.51,1.51,0,0,0-1.5,1.5V53.39a1.51,1.51,0,0,0,1.5,1.5H53.' +
    '39a1.51,1.51,0,0,0,1.5-1.5V10.61A1.51,1.51,0,0,0,53.39,9.11ZM30.31,23.51,25.14,' +
    '41.32a1.52,1.52,0,0,1-1.43,1.09h0a1.51,1.51,0,0,1-1.44-1.06L16.73,23.54a1.5,1.5,' +
    '0,1,1,2.86-.89L23.65,35.7l3.78-13a1.5,1.5,0,1,1,2.88.83Zm8.41,6.75h3.17a5.46,5.46,' +
    '0,0,1,5.45,5.45V37a5.46,5.46,0,0,1-5.45,5.45H38.72A5.46,5.46,0,0,1,33.27,37a1.5,1.5' +
    ',0,1,1,3,0h0a2.45,2.45,0,0,0,2.45,2.45h3.17A2.45,2.45,0,0,0,44.34,37V35.71a2.45,2.45' +
    ',0,0,0-2.45-2.45H38.72a5.46,5.46,0,0,1-5.45-5.45V27a5.46,5.46,0,0,1,5.45-5.45h3.63a5' +
    ',5,0,0,1,5,5,1.5,1.5,0,0,1-3,0,2,2,0,0,0-2-2H38.72A2.45,2.45,0,0,0,36.27,27v.77A2.45,' +
    '2.45,0,0,0,38.72,30.26Z" data-name="VS"/></svg>;';

const GAME_TYPE_ICON =
    '<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill="#494c4e" d="M19,10H13.01c-.01-1.06-.01-3.37,0-3.93V5.93c.02-.77.04-1.22.36-1.' +
    '53a1.793,1.793,0,0,1,1.04-.36l.15-.01a2.694,2.694,0,0,0,1.29-.3A2.205,2.205,0,0,0,16.9,2.27' +
    ',4.3,4.3,0,0,0,16.99.96a1,1,0,0,0-2,.07,3.026,3.026,0,0,1-.03.76.441.441,0,0,1-.09.2,1.893,1.' +
    '893,0,0,1-.41.05l-.18.01a3.611,3.611,0,0,0-2.3.91,3.831,3.831,0,0,0-.97,2.94v.13C11,6.59,11,' +
    '8.9,11.01,10H5a5,5,0,0,0-5,5v4a5,5,0,0,0,5,5H19a5,5,0,0,0,5-5V15A5,5,0,0,0,19,10Zm3,9a3.009,3.' +
    '009,0,0,1-3,3H5a3.009,3.009,0,0,1-3-3V15a3.009,3.009,0,0,1,3-3H19a3.009,3.009,0,0,1,3,3Z"/>' +
    '<path fill="#494c4e" d="M10,16.99a1,1,0,0,1-1,1H8v1a1,1,0,0,1-2,0v-1H5a1,1,0,1,1,0-2H6v-1a1' +
    ',1,0,0,1,2,0v1H9A1,1,0,0,1,10,16.99Z"/> <circle fill="#494c4e" cx="19" cy="15" r="1"/>' +
    '<circle fill="#494c4e" cx="19" cy="19" r="1"/> <circle fill="#494c4e" cx="15" cy="15" r="1"/>' +
    '<circle fill="#494c4e" cx="15" cy="19" r="1"/> </svg>';
@Component({
    selector: 'app-lobby-info',
    templateUrl: './lobby-info.component.html',
    styleUrls: ['./lobby-info.component.scss'],
})
export class LobbyInfoComponent {
    @Input() lobby: LobbyInfo = { lobbyID: 0, playerName: '', gameType: GameType.Classic, timer: 0, canJoin: false };
    // dictionnaries: Dictionnaries[]

    // constructor(private router: Router) {
    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer, private router: Router) {
        iconRegistry.addSvgIconLiteral('versus', sanitizer.bypassSecurityTrustHtml(VERSUS_ICON));
        iconRegistry.addSvgIconLiteral('game-type', sanitizer.bypassSecurityTrustHtml(GAME_TYPE_ICON));
    }

    joinLobby() {
        this.router.navigateByUrl('waiting');
    }
}
