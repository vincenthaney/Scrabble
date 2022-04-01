import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';

export interface ObjectiveUpdate {
    updateData: GameObjectivesData;
    completionMessages: string[];
}
