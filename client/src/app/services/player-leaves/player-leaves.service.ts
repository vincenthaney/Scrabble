import { Injectable, OnDestroy } from '@angular/core';
import { PlayerLeavesController } from '@app/controllers/player-leaves-controller/player-leaves.controller';
import { GameService } from '@app/services/';
import GameDispatcherService from '@app/services/game-dispatcher/game-dispatcher.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager/game-view-event-manager.service';
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
        private readonly gameViewEventManager: GameViewEventManagerService,
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

    handleJoinerLeaveGame(leaverName: string): void {
        this.joinerLeavesGameEvent.next(leaverName);
    }

    handleLocalPlayerLeavesGame(): void {
        this.playerLeavesController.handleLeaveGame(this.gameService.getGameId());
        this.gameService.resetGameId();
        this.gameViewEventManager.emitGameViewEvent('newMessage', null);
    }

    handleLeaveLobby(): void {
        const gameId = this.gameDispatcherService.getCurrentLobbyId();
        if (gameId) this.playerLeavesController.handleLeaveGame(gameId);
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
