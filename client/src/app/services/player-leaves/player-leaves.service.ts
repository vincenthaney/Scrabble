import { Injectable, OnDestroy } from '@angular/core';
import { PlayerLeavesController } from '@app/controllers/player-leaves-controller/player-leaves.controller';
import { GameService } from '@app/services/';
import GameDispatcherService from '@app/services/game-dispatcher/game-dispatcher.service';
import RoundManagerService from '@app/services/round-manager/round-manager.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PlayerLeavesService implements OnDestroy {
    private joinerLeavesGameEvent: Subject<string> = new Subject();
    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(
        private readonly playerLeavesController: PlayerLeavesController,
        private readonly gameDispatcherService: GameDispatcherService,
        private readonly gameService: GameService,
        private readonly roundManagerService: RoundManagerService,
    ) {
        this.playerLeavesController.subscribeToJoinerLeavesGameEvent(this.serviceDestroyed$, (leaverName: string) =>
            this.handleJoinerLeaveGame(leaverName),
        );
        this.playerLeavesController.subscribeToResetGameEvent(this.serviceDestroyed$, () => {
            this.gameService.resetServiceData();
            this.gameDispatcherService.resetServiceData();
            this.roundManagerService.resetServiceData();
        });
    }

    getGameId(): string {
        return this.gameDispatcherService.gameId;
    }

    handleJoinerLeaveGame(leaverName: string): void {
        this.joinerLeavesGameEvent.next(leaverName);
    }

    handleLocalPlayerLeavesGame(): void {
        this.playerLeavesController.handleLeaveGame(this.getGameId());
    }

    handleLeaveLobby(): void {
        if (this.getGameId()) this.playerLeavesController.handleLeaveGame(this.getGameId());
        this.gameDispatcherService.resetServiceData();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    subscribeToJoinerLeavesGameEvent(componentDestroyed$: Subject<boolean>, callback: (leaverName: string) => void): void {
        this.joinerLeavesGameEvent.pipe(takeUntil(componentDestroyed$)).subscribe(callback);
    }
}
