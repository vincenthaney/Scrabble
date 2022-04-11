import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VirtualPlayerProfile } from '@app/classes/communication/virtual-player-profiles';
import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { DEFAULT_TIMER_VALUE } from '@app/constants/pages-constants';
import { GameDispatcherService } from '@app/services';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profiles.service';
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
    playerName: string;
    playerNameValid: boolean;
    pageDestroyed$: Subject<boolean>;
    gameParameters: FormGroup;

    private virtualPlayerProfiles: VirtualPlayerProfile[];

    constructor(
        private router: Router,
        private gameDispatcherService: GameDispatcherService,
        private readonly virtualPlayerProfilesService: VirtualPlayerProfilesService,
    ) {
        this.gameTypes = GameType;
        this.gameModes = GameMode;
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.dictionaryOptions = [];
        this.virtualPlayerProfiles = [];
        this.playerName = '';
        this.playerNameValid = false;
        this.pageDestroyed$ = new Subject();
        this.gameParameters = new FormGroup({
            gameType: new FormControl(GameType.Classic, Validators.required),
            gameMode: new FormControl(GameMode.Multiplayer, Validators.required),
            level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
            virtualPlayerName: new FormControl('', Validators.required),
            timer: new FormControl(DEFAULT_TIMER_VALUE, Validators.required),
            // TODO: A changer avec la portion de vincent
            dictionary: new FormControl('Mon dictionnaire', Validators.required),
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

        this.virtualPlayerProfilesService
            .getVirtualPlayerProfiles()
            .then((profiles: VirtualPlayerProfile[]) => (this.virtualPlayerProfiles = profiles));
        this.gameParameters.patchValue({ virtualPlayerName: this.getVirtualPlayerNames()[0] });
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

    getVirtualPlayerNames(): string[] {
        if (!this.virtualPlayerProfiles) return [''];
        return this.virtualPlayerProfiles
            .filter((profile: VirtualPlayerProfile) => profile.level === (this.gameParameters.get('level')?.value as VirtualPlayerLevel))
            .map((profile: VirtualPlayerProfile) => profile.name);
    }

    private createGame(): void {
        if (this.gameParameters.get('gameMode')?.value === this.gameModes.Multiplayer) {
            this.router.navigateByUrl('waiting-room');
        }
        this.gameDispatcherService.handleCreateGame(this.playerName, this.gameParameters);
    }
}
