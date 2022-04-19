import { Injectable } from '@angular/core';
import { StartGameData } from '@app/classes/communication/game-config';
import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
import { ObjectiveData } from '@app/classes/communication/objective-data';
import { IResetServiceData } from '@app/utils/i-reset-service-data/i-reset-service-data';

@Injectable({
    providedIn: 'root',
})
export class ObjectivesManagerService implements IResetServiceData {
    private objectives?: GameObjectivesData;
    private isLocalPlayerPlayer1: boolean = false;

    initialize(startGameData: StartGameData, isLocalPlayerPlayer1: boolean) {
        this.objectives = {
            player1Objectives: startGameData.player1.objectives,
            player2Objectives: startGameData.player2.objectives,
        };
        this.isLocalPlayerPlayer1 = isLocalPlayerPlayer1;
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
