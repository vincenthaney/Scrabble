import { Component, Inject, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profiles.service';
import { VIRTUAL_PLAYER_NAME_VALIDATION } from '@app/constants/virtual-player-name-validation';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { VirtualPlayerData } from '@app/classes/admin/virtual-player-profile';
import { UpdateVirtualPlayerDialogParameters } from './update-virtual-player.component.types';

@Component({
    selector: 'app-update-virtual-player-dialog',
    templateUrl: './update-virtual-player-dialog.component.html',
    styleUrls: ['./update-virtual-player-dialog.component.scss'],
})
export class UpdateVirtualPlayerComponent implements OnChanges, OnDestroy {
    formParameters: FormGroup;
    isVirtualPlayerNameValid: boolean;
    virtualPlayerLevels: typeof VirtualPlayerLevel;
    virtualPlayerName: string;
    virtualPlayerId: string;
    private componentDestroyed$: Subject<boolean>;
    constructor(
        private dialogRef: MatDialogRef<UpdateVirtualPlayerComponent>,
        private virtualPlayerProfilesService: VirtualPlayerProfilesService,
        @Inject(MAT_DIALOG_DATA) public data: UpdateVirtualPlayerDialogParameters,
    ) {
        this.componentDestroyed$ = new Subject();
        this.isVirtualPlayerNameValid = false;
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.virtualPlayerName = data.name;
        this.virtualPlayerId = data.id;
        this.formParameters = new FormGroup({
            level: new FormControl(data.level),
            inputVirtualPlayerName: new FormControl(this.virtualPlayerName, [
                Validators.required,
                Validators.minLength(VIRTUAL_PLAYER_NAME_VALIDATION.minLength),
                Validators.maxLength(VIRTUAL_PLAYER_NAME_VALIDATION.maxLength),
            ]),
        });
    }

    ngOnChanges(): void {
        this.formParameters.controls.inputTitle?.updateValueAndValidity();
        this.isVirtualPlayerNameValid = this.formParameters.get('inputVirtualPlayerName')?.valid ?? false;
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    updateVirtualPlayer(): void {
        this.virtualPlayerProfilesService.updateVirtualPlayer({
            name: this.formParameters.get('inputVirtualPlayerName')?.value,
            level: this.formParameters.get('level')?.value,
            id: this.data.id,
        } as VirtualPlayerData);
        this.closeDialog();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }
}
