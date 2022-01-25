import { Component, Input } from '@angular/core';
import { IPlayer } from '@app/classes/player';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    @Input() opponent: IPlayer;
    messageWaitingRoom: string;
    constructor() {
        this.messageWaitingRoom = "En attente qu'un adversaire se joigne à votre partie.";
    }

    isOpponentFound() {
        if (this.opponent == null) {
            this.messageWaitingRoom = "En attente qu'un adversaire se joigne à votre partie.";
            return false;
        } else {
            this.messageWaitingRoom = IPlayer.name + ' à rejoint votre partie.';
            return true;
        }
    }
}
