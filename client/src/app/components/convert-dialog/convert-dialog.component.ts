import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VirtualPlayerProfile } from '@app/classes/communication/virtual-player-profiles';
import { GameMode } from '@app/classes/game-mode';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { GameDispatcherService } from '@app/services';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profiles.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-convert-dialog',
    templateUrl: './convert-dialog.component.html',
    styleUrls: ['./convert-dialog.component.scss'],
})
export class ConvertDialogComponent implements OnInit, OnDestroy {
    virtualPlayerLevels: typeof VirtualPlayerLevel;
    playerName: string;
    pageDestroyed$: Subject<boolean>;
    gameParameters: FormGroup;
    isConverting: boolean;

    private virtualPlayerProfiles: VirtualPlayerProfile[];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: string,
        private gameDispatcherService: GameDispatcherService,
        private readonly virtualPlayerProfilesService: VirtualPlayerProfilesService,
    ) {
        this.isConverting = false;
        this.playerName = data;
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.virtualPlayerProfiles = [];
        this.pageDestroyed$ = new Subject();
        this.gameParameters = new FormGroup({
            gameMode: new FormControl(GameMode.Solo, Validators.required),
            level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
            virtualPlayerName: new FormControl('', Validators.required),
        });
    }

    ngOnInit(): void {
        this.gameParameters
            .get('level')
            ?.valueChanges.pipe(takeUntil(this.pageDestroyed$))
            .subscribe(() => this.gameParameters?.get('virtualPlayerName')?.reset());

        this.virtualPlayerProfilesService
            .getVirtualPlayerProfiles()
            .then((profiles: VirtualPlayerProfile[]) => (this.virtualPlayerProfiles = profiles));
    }

    ngOnDestroy(): void {
        if (!this.isConverting) this.returnToWaiting();
        this.pageDestroyed$.next(true);
        this.pageDestroyed$.complete();
    }

    onSubmit(): void {
        this.isConverting = true;
        this.handleConvertToSolo();
    }

    getVirtualPlayerNames(): string[] {
        if (!this.virtualPlayerProfiles) return [''];
        return this.virtualPlayerProfiles
            .filter((profile: VirtualPlayerProfile) => profile.level === (this.gameParameters.get('level')?.value as VirtualPlayerLevel))
            .map((profile: VirtualPlayerProfile) => profile.name);
    }

    private handleConvertToSolo(): void {
        this.gameDispatcherService.handleRecreateGame(this.gameParameters);
    }

    private returnToWaiting(): void {
        this.gameDispatcherService.handleRecreateGame();
    }
}
