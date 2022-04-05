import { Component, OnDestroy, OnInit } from '@angular/core';
import { InitializeGameData } from '@app/classes/communication/game-config';
import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
import { ObjectiveData } from '@app/classes/communication/objective-data';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-objective-box',
    templateUrl: './objective-box.component.html',
    styleUrls: ['./objective-box.component.scss'],
})
export class ObjectiveBoxComponent implements OnInit, OnDestroy {
    private objectives: GameObjectivesData = {};
    private isLocalPlayerPlayer1: boolean = false;

    private componentDestroyed$: Subject<boolean> = new Subject<boolean>();

    constructor(private readonly gameViewEventManagerService: GameViewEventManagerService, private readonly gameService: GameService) {}

    ngOnInit(): void {
        this.isLocalPlayerPlayer1 = this.gameService.isLocalPlayerPlayer1();

        this.gameViewEventManagerService.subscribeToGameViewEvent(
            'gameInitialized',
            this.componentDestroyed$,
            (gameData: InitializeGameData | undefined) => {
                if (gameData) {
                    this.objectives = {};
                    this.isLocalPlayerPlayer1 = gameData.localPlayerId === gameData.startGameData.player1.id;
                }
            },
        );
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    getPublicObjectives(): ObjectiveData[] {
        return this.getObjectives().filter((objective) => objective.isPublic);
    }

    getPrivateObjectives(): ObjectiveData[] {
        return this.getObjectives().filter((objective) => !objective.isPublic);
    }

    private getObjectives(): ObjectiveData[] {
        return (this.isLocalPlayerPlayer1 ? this.objectives.player1Objectives : this.objectives.player2Objectives) || [];
    }
}
