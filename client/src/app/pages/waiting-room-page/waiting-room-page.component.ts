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
        if (this.opponent != null) {
            this.messageWaitingRoom = "En attente qu'un adversaire se joigne à votre partie.";
            return false;
        } else {
            this.messageWaitingRoom = 'Un adversaire souhaite se joindre à votre partie.';
            return true;
        }
    }
}
