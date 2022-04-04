import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { TwoTenLetter } from '@app/classes/objectives/objective-classes/two-ten-letter';

export const GENERATE_LIST_OF_ALL_OBJECTIVES = (): AbstractObjective[] => {
    return [new TwoTenLetter()];
};

export const NUMBER_OF_OBJECTIVES_IN_GAME = 4;

export const OBJECTIVE_COMPLETE_MESSAGE = (name: string, bonusPoints: number) => ` complété l'objectif ${name} pour ${bonusPoints} points`;
