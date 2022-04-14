import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VirtualPlayerProfile } from '@app/classes/admin/virtual-player-profile';
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

    private virtualPlayerNameMap: Map<VirtualPlayerLevel, string[]>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: string,
        private gameDispatcherService: GameDispatcherService,
        private readonly virtualPlayerProfilesService: VirtualPlayerProfilesService,
    ) {
        this.isConverting = false;
        this.playerName = data;
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.virtualPlayerNameMap = new Map();
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

        this.virtualPlayerProfilesService.subscribeToVirtualPlayerProfilesUpdateEvent(this.pageDestroyed$, (profiles) => {
            this.generateVirtualPlayerProfileMap(profiles);
        });
        this.virtualPlayerProfilesService.getAllVirtualPlayersProfile();
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
        if (!this.virtualPlayerNameMap) return [];
        const namesForLevel: string[] | undefined = this.virtualPlayerNameMap.get(this.gameParameters.get('level')?.value);
        return namesForLevel ?? [];
    }

    private generateVirtualPlayerProfileMap(virtualPlayerProfiles: VirtualPlayerProfile[]): void {
        virtualPlayerProfiles.forEach((profile: VirtualPlayerProfile) => {
            const namesForLevel: string[] | undefined = this.virtualPlayerNameMap.get(profile.level);
            if (!namesForLevel) this.virtualPlayerNameMap.set(profile.level, [profile.name]);
            else namesForLevel.push(profile.name);
        });
    }

    private handleConvertToSolo(): void {
        this.gameDispatcherService.handleRecreateGame(this.gameParameters);
    }

    private returnToWaiting(): void {
        this.gameDispatcherService.handleRecreateGame();
    }
}
