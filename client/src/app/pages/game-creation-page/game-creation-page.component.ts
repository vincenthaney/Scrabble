import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { NameFieldComponent } from '@app/components/name-field/name-field.component';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    @ViewChild(NameFieldComponent) child: NameFieldComponent;
    gameTypes = GameType;
    gameModes = GameMode;
    virtualPlayerLevels = VirtualPlayerLevel;
    // TODO : when dictionnaries and timers are implemented, create mat-options with ngFor on the available lists
    timerOptions: number[];
    dictOptions: string[];

    gameParameters: FormGroup = new FormGroup({
        gameType: new FormControl(GameType.Classic, Validators.required),
        gameMode: new FormControl(GameMode.Solo, Validators.required),
        level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
        timer: new FormControl('', Validators.required),
        dict: new FormControl('', Validators.required),
    });

    constructor(private router: Router, private gameDispatcherService: GameDispatcherService) {}

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

    isFormValid(): boolean {
        return this.gameParameters?.valid && this.child.formParameters?.valid;
    }

    onSubmit() {
        if (this.isFormValid()) {
            this.createGame();
        } else {
            this.child.formParameters.markAllAsTouched();
        }
    }

    createGame() {
        // send new game request to server (?)
        this.gameDispatcherService.handleCreateGame(this.child.playerName, this.gameParameters);
        this.router.navigateByUrl('waiting-room');
    }
}
