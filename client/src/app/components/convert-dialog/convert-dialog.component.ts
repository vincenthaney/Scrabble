import { Component, Inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { GameDispatcherService } from '@app/services';
import { randomizeArray } from '@app/utils/randomize-array';
import { Subject } from 'rxjs';
import { ConvertDialogParameters } from './convert-dialog.component.type';

@Component({
    selector: 'app-convert-dialog',
    templateUrl: './convert-dialog.component.html',
    styleUrls: ['./convert-dialog.component.scss'],
})
export class ConvertDialogComponent implements OnDestroy {
    virtualPlayerLevels: typeof VirtualPlayerLevel;
    virtualPlayerNames: string[];
    playerName: string;
    pageDestroyed$: Subject<boolean>;
    gameParameters: FormGroup;
    isConverting: boolean;

    constructor(@Inject(MAT_DIALOG_DATA) public data: ConvertDialogParameters, private gameDispatcherService: GameDispatcherService) {
        this.isConverting = false;
        this.playerName = data.hostName;
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.virtualPlayerNames = randomizeArray(['Victoria', 'Aristote', 'Herménégilde'].filter((name: string) => name !== this.playerName));
        this.pageDestroyed$ = new Subject();
        this.gameParameters = new FormGroup({
            level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
            virtualPlayerName: new FormControl(this.virtualPlayerNames[0], Validators.required),
        });
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

    handleConvertToSolo(): void {
        this.gameDispatcherService.handleRecreateGame(this.gameParameters);
    }

    returnToWaiting(): void {
        this.gameDispatcherService.handleRecreateGame();
    }
}
