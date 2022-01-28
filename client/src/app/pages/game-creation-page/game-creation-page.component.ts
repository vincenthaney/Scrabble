import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    isNameValid: boolean = false;
    gameTypes = GameType;
    gameModes = GameMode;

    gameType: GameType = GameType.Classic;
    gameMode: GameMode = GameMode.Solo;

    // TODO : when dictionnaries and timers are implemented, create mat-options with ngFor on the available lists
    timerOptions: number[];
    dictOptions: string[];

    gameParameters = new FormGroup({
        inputTimer: new FormControl('', Validators.required),
        inputDict: new FormControl('', Validators.required),
    });

    constructor(private router: Router) {}

    createGame() {
        if (this.gameParameters.valid && this.isNameValid) {
            // send new game request to server (?)
            // route to waiting room
            this.router.navigateByUrl('waiting');
        }
    }

    onNameChange(isNameValid: boolean) {
        this.isNameValid = isNameValid;
    }
}
