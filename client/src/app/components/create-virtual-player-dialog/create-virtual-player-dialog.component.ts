import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profiles.service';
import { VIRTUAL_PLAYER_NAME_VALIDATION } from '@app/constants/virtual-player-name-validation';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { VirtualPlayerData } from '@app/classes/admin/virtual-player-profile';

@Component({
    selector: 'app-create-virtual-player-dialog',
    templateUrl: './create-virtual-player-dialog.component.html',
    styleUrls: ['./create-virtual-player-dialog.component.scss'],
})
export class CreateVirtualPlayerComponent implements OnDestroy {
    formParameters: FormGroup;
    virtualPlayerLevels: typeof VirtualPlayerLevel;
    virtualPlayerName: string;
    isVirtualPlayerNameValid: boolean;
    private componentDestroyed$: Subject<boolean>;
    constructor(private dialogRef: MatDialogRef<CreateVirtualPlayerComponent>, private virtualPlayerProfilesService: VirtualPlayerProfilesService) {
        this.componentDestroyed$ = new Subject();
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.virtualPlayerName = '';
        this.isVirtualPlayerNameValid = false;
        this.formParameters = new FormGroup({
            level: new FormControl(VirtualPlayerLevel.Beginner),
            inputVirtualPlayerName: new FormControl(this.virtualPlayerName, [
                Validators.required,
                Validators.minLength(VIRTUAL_PLAYER_NAME_VALIDATION.minLength),
                Validators.maxLength(VIRTUAL_PLAYER_NAME_VALIDATION.maxLength),
            ]),
        });
    }

    onPlayerNameChanges([playerName, valid]: [string, boolean]): void {
        this.virtualPlayerName = playerName;
        this.isVirtualPlayerNameValid = valid;
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    async createVirtualPlayer(): Promise<void> {
        await this.virtualPlayerProfilesService.createVirtualPlayer({
            name: this.virtualPlayerName,
            level: this.formParameters.get('level')?.value as VirtualPlayerLevel,
        } as VirtualPlayerData);
        this.closeDialog();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
