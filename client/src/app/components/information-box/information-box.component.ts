import { Component } from '@angular/core';
import { OnlinePlayer, Opponent, Player } from '@app/classes/player';

@Component({
    selector: 'app-information-box',
    templateUrl: './information-box.component.html',
    styleUrls: ['./information-box.component.scss'],
})
export class InformationBoxComponent {
    player1: Player = new Player("Mathilde");
    player2: Opponent = new OnlinePlayer("Raphael");
}
