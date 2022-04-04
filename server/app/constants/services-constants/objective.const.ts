import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ConsecutivePlaceOrientationObjective } from '@app/classes/objectives/consecutive-place-orientation/consecutive-place-orientation';

export const GENERATE_LIST_OF_ALL_OBJECTIVES = (): AbstractObjective[] => {
    return [new ConsecutivePlaceOrientationObjective()];
};

export const NUMBER_OF_OBJECTIVES_IN_GAME = 4;

export const OBJECTIVE_COMPLETE_MESSAGE = (name: string, bonusPoints: number) => ` complété l'objectif ${name} pour ${bonusPoints} points`;
