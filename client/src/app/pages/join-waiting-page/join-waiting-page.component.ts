import { Component } from '@angular/core';

@Component({
    selector: 'app-waiting-page',
    templateUrl: './join-waiting-page.component.html',
    styleUrls: ['./join-waiting-page.component.scss'],
})
export class JoinWaitingPageComponent {
    waitingGameName: string = 'testName';
    waitingGameType: string = 'testType';
    waitingGameTimer: string = 'timer';
    waitingGameDictionary: string = 'dictionary';
    waitingPlayerName: string = 'waitingPlayer';
}
