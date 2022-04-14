import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LobbyInfo } from '@app/classes/communication/';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { Timer } from '@app/classes/timer/timer';
import { TEST_DICTIONARY } from '@app/constants/controller-test-constants';

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
            dictionary: TEST_DICTIONARY,
            hostName: '',
            gameType: GameType.Classic,
            gameMode: GameMode.Solo,
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
