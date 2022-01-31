import { Component } from '@angular/core';
import { DIALOG_BUTTON_CONTENT, DIALOG_CONTENT, DIALOG_TITLE, GameRequestState } from './join-waiting-page.component.const';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OnlinePlayer } from '@app/classes/player';
import { Router } from '@angular/router';

@Component({
    selector: 'app-waiting-page',
    templateUrl: './join-waiting-page.component.html',
    styleUrls: ['./join-waiting-page.component.scss'],
})
export class JoinWaitingPageComponent {
    state: GameRequestState.Waiting;
    waitingGameName: string = 'testName';
    waitingGameType: string = 'testType';
    waitingGameTimer: string = 'timer';
    waitingGameDictionary: string = 'dictionary';
    waitingPlayerName: string = 'waitingPlayer';
}
