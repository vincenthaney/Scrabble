import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { NAME_VALIDATION } from '@app/classes/name-validation';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    gameTypes = GameType;
    gameModes = GameMode;
    virtualPlayerLevels = VirtualPlayerLevel;
    // TODO : when dictionnaries and timers are implemented, create mat-options with ngFor on the available lists
    timerOptions: number[];
    dictoptions: string[];
    gameParameters: FormGroup = new FormGroup({
        gameType: new FormControl(GameType.Classic, Validators.required),
        gameMode: new FormControl(GameMode.Solo, Validators.required),
        level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
        timer: new FormControl('', Validators.required),
        dict: new FormControl('', Validators.required),
        name: new FormControl('', [
            Validators.required,
            Validators.pattern(NAME_VALIDATION.rule),
            Validators.minLength(NAME_VALIDATION.minLength),
            Validators.maxLength(NAME_VALIDATION.maxLength),
        ]),
    });

    constructor(private router: Router) {}

    ngOnInit() {
        this.gameParameters.get('gameMode')?.valueChanges.subscribe((value) => {
            if (value === this.gameModes.Solo) {
                this.gameParameters?.get('level')?.setValidators([Validators.required]);
            } else {
                this.gameParameters?.get('level')?.clearValidators();
            }
            this.gameParameters?.get('level')?.updateValueAndValidity();
        });
    }

    onSubmit() {
        if (this.gameParameters?.valid) {
            this.createGame();
        }
    }

    createGame() {
        // send new game request to server (?)
        this.router.navigateByUrl('waiting-room');
    }
}
