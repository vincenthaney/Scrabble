import { Injectable, OnDestroy } from '@angular/core';
import { StartGameData } from '@app/classes/communication/game-config';
import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
import { ObjectiveData } from '@app/classes/communication/objective-data';
import { IResetServiceData } from '@app/classes/i-reset-service-data';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ObjectivesManagerService implements OnDestroy, IResetServiceData {
    private objectives?: GameObjectivesData;
    private isLocalPlayerPlayer1: boolean = false;

    private componentDestroyed$: Subject<boolean> = new Subject<boolean>();

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    initialize(objectives: GameObjectivesData, isLocalPlayerPlayer1: boolean) {
        this.objectives = objectives;
        this.isLocalPlayerPlayer1 = isLocalPlayerPlayer1;
    }

    initializeFromStartGameData(startGameData: StartGameData, isLocalPlayerPlayer1: boolean) {
        this.initialize(
            {
                player1Objectives: startGameData.player1.objectives,
                player2Objectives: startGameData.player2.objectives,
            },
            isLocalPlayerPlayer1,
        );
    }

    updateObjectives(objectives: GameObjectivesData) {
        this.objectives = objectives;
    }

    getPublicObjectives(): ObjectiveData[] {
        return this.getObjectives().filter((objective) => objective.isPublic);
    }

    getPrivateObjectives(): ObjectiveData[] {
        return this.getObjectives().filter((objective) => !objective.isPublic);
    }

    resetServiceData(): void {
        this.objectives = undefined;
    }

    private getObjectives(): ObjectiveData[] {
        return (this.isLocalPlayerPlayer1 ? this.objectives?.player1Objectives : this.objectives?.player2Objectives) || [];
    }
}
