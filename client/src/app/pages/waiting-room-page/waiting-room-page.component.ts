import { Component, Input } from '@angular/core';
import { OnlinePlayer } from '@app/classes/player';
import { WaitingRoomMessages } from './waiting-room-page.component.const';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    @Input() opponent: OnlinePlayer | undefined;
    host: OnlinePlayer;
    messageWaitingRoom: string = WaitingRoomMessages.HostWaitingMessage;
    isOpponentFound: boolean;

    setHost(host: OnlinePlayer) {
        this.host = host;
    }

    setOpponent(opponent: OnlinePlayer) {
        this.opponent = opponent;
        this.messageWaitingRoom = this.opponent.name + WaitingRoomMessages.OpponentFoundMessage;
        this.isOpponentFound = true;
    }

    disconnectOpponent() {
        this.opponent = undefined;
        this.messageWaitingRoom = WaitingRoomMessages.HostWaitingMessage;
        this.isOpponentFound = false;
    }
}
