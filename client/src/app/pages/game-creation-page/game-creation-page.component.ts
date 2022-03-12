import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { DEFAULT_DICTIONARY_VALUE, DEFAULT_TIMER_VALUE } from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services';
import { randomizeArray } from '@app/utils/randomize-array';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit, OnDestroy {
    gameTypes = GameType;
    gameModes = GameMode;
    virtualPlayerLevels = VirtualPlayerLevel;
    // TODO : when dictionnaries and timers options are implemented, create mat-options with ngFor on the available lists
    dictionaryOptions: string[];
    virtualPlayerNames: string[] = randomizeArray(['Victoria', 'Vladimir', 'Herménégilde']);
    playerName: string = '';
    playerNameValid: boolean = false;

    serviceDestroyed$: Subject<boolean> = new Subject();

    gameParameters: FormGroup = new FormGroup({
        gameType: new FormControl(GameType.Classic, Validators.required),
        gameMode: new FormControl(GameMode.Multiplayer, Validators.required),
        level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
        // we must disable to use the first name from the randomized virtual player names array created in this class as the default value.
        // eslint-disable-next-line no-invalid-this
        virtualPlayerName: new FormControl(this.virtualPlayerNames[0], Validators.required),
        timer: new FormControl(DEFAULT_TIMER_VALUE, Validators.required),
        dictionary: new FormControl(DEFAULT_DICTIONARY_VALUE, Validators.required),
    });

    constructor(private router: Router, private gameDispatcherService: GameDispatcherService) {}

    ngOnInit(): void {
        this.gameParameters
            .get('gameMode')
            ?.valueChanges.pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((value) => {
                if (value === this.gameModes.Solo) {
                    this.gameParameters?.get('level')?.setValidators([Validators.required]);
                } else {
                    this.gameParameters?.get('level')?.clearValidators();
                }
                this.gameParameters?.get('level')?.updateValueAndValidity();
            });
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    isFormValid(): boolean {
        return this.gameParameters?.valid && this.playerNameValid;
    }

    onSubmit(): void {
        if (this.isFormValid()) {
            this.createGame();
        }
    }

    createGame(): void {
        if (this.gameParameters.get('gameMode')?.value === this.gameModes.Multiplayer) {
            this.router.navigateByUrl('waiting-room');
        } else {
            this.router.navigateByUrl('game');
        }
        this.gameDispatcherService.handleCreateGame(this.playerName, this.gameParameters);
    }

    onPlayerNameChanges([playerName, valid]: [string, boolean]): void {
        this.playerName = playerName;
        this.playerNameValid = valid;
    }
}
