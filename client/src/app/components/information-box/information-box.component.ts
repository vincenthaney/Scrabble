import { Component } from '@angular/core';

@Component({
    selector: 'app-information-box',
    templateUrl: './information-box.component.html',
    styleUrls: ['./information-box.component.scss'],
})
export class InformationBoxComponent {
    player1 = { name: 'Mathilde', score: 420 };
    player2 = { name: 'Raphael', score: 69 };
}
