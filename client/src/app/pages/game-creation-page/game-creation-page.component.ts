import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { NameValidation } from '@app/classes/name-validation';

// TODO : remove and put in seperate file when timer is implemented
const DEFAULT_TIMER = 60;

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    gameTypes = GameType;
    gameModes = GameMode;

    gameType: GameType = GameType.Classic;
    gameMode: GameMode = GameMode.Solo;
    playerName: string;

    // TODO : when dictionnaries and timers are implemented, create mat-options with ngFor on the available lists
    timer: number = DEFAULT_TIMER;
    dictionnaryName: string = 'default';

    playerNameController = new FormControl('', [
        Validators.pattern(NameValidation.rule),
        Validators.minLength(NameValidation.minLength),
        Validators.maxLength(NameValidation.maxLength)],
    );

    constructor(private router: Router) {}

    createGame() {
        if (this.playerNameController.invalid) {
            // open dialog 'please correct username'
        } else {
            // send new game request to server (?)
            // route to waiting room
            this.router.navigateByUrl('waiting');
        }
    }

    onNameFieldChange(newName: string) {
        this.playerName! = newName;
    }
}
