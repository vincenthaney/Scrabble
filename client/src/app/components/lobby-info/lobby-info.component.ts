import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LobbyInfo } from '@app/classes/communication/';
import { GameType } from '@app/classes/game-type';
import { Timer } from '@app/classes/timer/timer';
import { DEFAULT_DICTIONARY } from '@app/constants/controller-test-constants';

@Component({
    selector: 'app-lobby-info',
    templateUrl: './lobby-info.component.html',
    styleUrls: ['./lobby-info.component.scss'],
})
export class LobbyInfoComponent implements OnInit {
    @Input() lobby: LobbyInfo;
    @Output() joinLobbyId: EventEmitter<string>;
    roundTime: Timer;

    constructor() {
        this.joinLobbyId = new EventEmitter<string>();
        this.lobby = {
            lobbyId: '0',
            dictionary: DEFAULT_DICTIONARY,
            hostName: '',
            gameType: GameType.Classic,
            maxRoundTime: 0,
            canJoin: false,
        };
        this.roundTime = Timer.convertTime(this.lobby.maxRoundTime);
    }

    ngOnInit(): void {
        this.roundTime = Timer.convertTime(this.lobby.maxRoundTime);
    }

    joinLobby(): void {
        this.joinLobbyId.emit(this.lobby.lobbyId);
    }
}
