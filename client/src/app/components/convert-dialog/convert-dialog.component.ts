import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { GameDispatcherService } from '@app/services';
import { randomizeArray } from '@app/utils/randomize-array';
import { Subject } from 'rxjs';

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

    constructor(private router: Router, private gameDispatcherService: GameDispatcherService) {
        this.isConverting = false;
        this.virtualPlayerLevels = VirtualPlayerLevel;
        this.virtualPlayerNames = randomizeArray(['Victoria', 'Vladimir', 'Herménégilde']);
        this.playerName = '';
        this.pageDestroyed$ = new Subject();
        this.gameParameters = new FormGroup({
            level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
            virtualPlayerName: new FormControl(this.virtualPlayerNames[0], Validators.required),
        });
    }

    ngOnDestroy(): void {
        this.pageDestroyed$.next(true);
        this.pageDestroyed$.complete();

    }

    isFormValid(): boolean {
        return this.gameParameters?.valid && this.gameParameters.get('virtualPlayerName')?.value !== this.playerName;
    }

    onSubmit(): void {
        if (this.isFormValid()) {
            this.isConverting = true;
            this.handleConvertToSolo();
        }
    }

    handleConvertToSolo(): void {
        this.gameDispatcherService.handleConvertToSolo(this.gameParameters);
        // this.router.navigateByUrl('game');
        // this.gameDispatcherService.handleCreateGame(this.playerName, this.gameParameters);
    }

    returnToWaiting(): void {
        this.gameDispatcherService.handleReturnToWaiting();
        // this.gameDispatcherService.handleCreateGame(this.playerName, this.gameParameters);
    }
}
