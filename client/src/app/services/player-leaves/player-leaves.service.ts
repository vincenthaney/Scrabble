import { Injectable, OnDestroy } from '@angular/core';
import { PlayerLeavesController } from '@app/controllers/player-leaves-controller/player-leaves.controller';
import { GameService } from '@app/services/';
import GameDispatcherService from '@app/services/game-dispatcher/game-dispatcher.service';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PlayerLeavesService implements OnDestroy {
    joinerLeaveGameEvent: Subject<string> = new Subject();
    joinerLeaveGameSubscription: Subscription;
    serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(
        private readonly playerLeavesController: PlayerLeavesController,
        private readonly gameDispatcherService: GameDispatcherService,
        private readonly gameService: GameService,
        private readonly roundManagerService: RoundManagerService,
    ) {
        this.joinerLeaveGameSubscription = this.playerLeavesController.joinerLeaveGameEvent
            .pipe(takeUntil(this.serviceDestroyed$))
            .subscribe((leaverName: string) => this.handleJoinerLeaveGame(leaverName));

        this.playerLeavesController.resetGameEvent.pipe(takeUntil(this.serviceDestroyed$)).subscribe(() => {
            this.gameService.resetServiceData();
            this.gameDispatcherService.resetServiceData();
            this.roundManagerService.resetServiceData();
        });
    }

    getGameId(): string {
        return this.gameDispatcherService.gameId;
    }

    handleJoinerLeaveGame(leaverName: string) {
        this.joinerLeaveGameEvent.next(leaverName);
    }

    handleLocalPlayerLeavesGame(): void {
        this.playerLeavesController.handleLeaveGame(this.getGameId());
    }

    handleLeaveLobby() {
        if (this.getGameId()) this.playerLeavesController.handleLeaveGame(this.getGameId());
        this.gameDispatcherService.resetServiceData();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }
}
