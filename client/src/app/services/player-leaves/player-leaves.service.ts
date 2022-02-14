import { Injectable, OnDestroy } from '@angular/core';
import { IResetableService } from '@app/classes/i-resetable-service';
import { PlayerLeavesController } from '@app/controllers/player-leaves-controller/player-leaves.controller';
import GameDispatcherService from '@app/services/game-dispatcher/game-dispatcher.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PlayerLeavesService implements OnDestroy, IResetableService {
    joinerLeaveGameEvent: Subject<string> = new Subject();
    joinerLeaveGameSubscription: Subscription;

    serviceDestroyed$: Subject<boolean> = new Subject();

    private gameId: string | undefined;

    constructor(private readonly playerLeavesController: PlayerLeavesController, private readonly gameDispatcherService: GameDispatcherService) {
        this.joinerLeaveGameSubscription = this.playerLeavesController.joinerLeaveGameEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((leaverName: string) => this.handleJoinerLeaveGame(leaverName));

        this.gameDispatcherService.gameIdUpdate.pipe(takeUntil(this.serviceDestroyed$)).subscribe((gameId: string | undefined) => {
            this.gameId = gameId;
        });
    }

    handleJoinerLeaveGame(leaverName: string) {
        this.joinerLeaveGameEvent.next(leaverName);
    }

    handleLocalPlayerLeavesGame(): void {
        this.playerLeavesController.handleLeaveGame(this.gameId);
    }

    handleLeaveLobby() {
        if (this.gameId) this.playerLeavesController.handleLeaveGame(this.gameId);
        this.resetServiceData();
        this.gameDispatcherService.resetServiceData();
    }

    resetServiceData(): void {
        this.gameId = '';
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }
}
