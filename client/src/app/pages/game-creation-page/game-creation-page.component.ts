import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { DEFAULT_TIMER_VALUE } from '@app/constants/pages-constants';
import { DICTIONARY_NAME_KEY, PLAYER_NAME_KEY, TIMER_KEY } from '@app/constants/session-storage-constants';
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
    gameTypes: typeof GameType;
    gameModes: typeof GameMode;
    virtualPlayerLevels: typeof VirtualPlayerLevel;
    dictionaryOptions: string[];
    virtualPlayerNames: string[];
    playerName: string;
    playerNameValid: boolean;
    pageDestroyed$: Subject<boolean>;
    gameParameters: FormGroup;

    constructor(private router: Router, private gameDispatcherService: GameDispatcherService) {
        this.gameTypes = GameType;
        this.gameModes = GameMode;
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.dictionaryOptions = [];
        this.virtualPlayerNames = randomizeArray(['Victoria', 'Aristote', 'Herménégilde']);
        this.playerName = window.localStorage.getItem(PLAYER_NAME_KEY) || '';
        this.playerNameValid = false;
        this.pageDestroyed$ = new Subject();
        this.gameParameters = new FormGroup({
            gameType: new FormControl(GameType.Classic, Validators.required),
            gameMode: new FormControl(GameMode.Multiplayer, Validators.required),
            level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
            virtualPlayerName: new FormControl(this.virtualPlayerNames[0], Validators.required),
            timer: new FormControl(this.getDefaultTimerValue(), Validators.required),
            // TODO: A changer avec la portion de vincent
            dictionary: new FormControl(window.localStorage.getItem(DICTIONARY_NAME_KEY) || 'Mon dictionnaire', Validators.required),
        });
    }

    ngOnInit(): void {
        this.gameParameters
            .get('gameMode')
            ?.valueChanges.pipe(takeUntil(this.pageDestroyed$))
            .subscribe((value) => {
                if (value === this.gameModes.Solo) {
                    this.gameParameters?.get('level')?.setValidators([Validators.required]);
                } else {
                    this.gameParameters?.get('level')?.clearValidators();
                }
                this.gameParameters?.get('level')?.updateValueAndValidity();
            });
        this.gameDispatcherService.subscribeToReceivedLobbyDataEvent(this.pageDestroyed$, () => {
            if (this.gameParameters.get('gameMode')?.value === this.gameModes.Multiplayer) this.router.navigateByUrl('waiting-room');
        });
    }

    ngOnDestroy(): void {
        this.pageDestroyed$.next(true);
        this.pageDestroyed$.complete();
    }

    isFormValid(): boolean {
        return this.gameParameters?.valid && this.playerNameValid;
    }

    onSubmit(): void {
        if (this.isFormValid()) {
            window.localStorage.setItem(PLAYER_NAME_KEY, this.playerName);
            window.localStorage.setItem(DICTIONARY_NAME_KEY, this.gameParameters.get('dictionary')?.value);
            window.localStorage.setItem(TIMER_KEY, this.gameParameters.get('timer')?.value);
            this.createGame();
        }
    }
    onPlayerNameChanges([playerName, valid]: [string, boolean]): void {
        this.playerName = playerName;
        this.playerNameValid = valid;
    }

    private getDefaultTimerValue(): number {
        const INVALID = -1;
        const time = Number.parseInt(window.localStorage.getItem(TIMER_KEY) || `${INVALID}`, 10);
        return !Number.isNaN(time) && time > INVALID ? time : DEFAULT_TIMER_VALUE;
    }

    private createGame(): void {
        this.gameDispatcherService.handleCreateGame(this.playerName, this.gameParameters);
    }
}
