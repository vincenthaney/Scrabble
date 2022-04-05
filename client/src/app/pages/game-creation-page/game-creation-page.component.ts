import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DictionarySummary } from '@app/classes/communication/dictionary';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { INVALID_DICTIONARY_ID } from '@app/constants/controllers-errors';
import { DEFAULT_TIMER_VALUE } from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services';
import { DictionariesService } from '@app/services/dictionaries-service/dictionaries.service';
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
    dictionaryOptions: DictionarySummary[];
    virtualPlayerNames: string[];
    playerName: string;
    playerNameValid: boolean;
    pageDestroyed$: Subject<boolean>;
    gameParameters: FormGroup;
    constructor(
        private router: Router,
        private gameDispatcherService: GameDispatcherService,
        private readonly dictionaryService: DictionariesService,
    ) {
        this.gameTypes = GameType;
        this.gameModes = GameMode;
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.dictionaryOptions = [];
        this.virtualPlayerNames = randomizeArray(['Victoria', 'Aristote', 'Herménégilde']);
        this.playerName = '';
        this.playerNameValid = false;
        this.pageDestroyed$ = new Subject();
        this.gameParameters = new FormGroup({
            gameType: new FormControl(GameType.Classic, Validators.required),
            gameMode: new FormControl(GameMode.Multiplayer, Validators.required),
            level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
            virtualPlayerName: new FormControl(this.virtualPlayerNames[0], Validators.required),
            timer: new FormControl(DEFAULT_TIMER_VALUE, Validators.required),
            dictionary: new FormControl(undefined, Validators.required),
        });

        this.gameDispatcherService
            .observeGameCreationFailed()
            .pipe(takeUntil(this.pageDestroyed$))
            .subscribe(async (error: HttpErrorResponse) => {
                if (error.error.message === INVALID_DICTIONARY_ID) {
                    await this.dictionaryService.updateAllDictionaries();
                }
            });
        this.dictionaryService.subscribeToDictionariestUpdateDataEvent(this.pageDestroyed$, () => {
            this.dictionaryOptions = this.dictionaryService.getDictionaries();
            this.gameParameters.get('dictionary')?.setValue(this.dictionaryOptions[0]);
        });
    }

    async ngOnInit(): Promise<void> {
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
        await this.dictionaryService.updateAllDictionaries();
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
            this.createGame();
        }
    }
    onPlayerNameChanges([playerName, valid]: [string, boolean]): void {
        this.playerName = playerName;
        this.playerNameValid = valid;
    }

    private createGame(): void {
        if (this.gameParameters.get('gameMode')?.value === this.gameModes.Multiplayer) {
            this.router.navigateByUrl('waiting-room');
        }
        this.gameDispatcherService.handleCreateGame(this.playerName, this.gameParameters);
    }
}
