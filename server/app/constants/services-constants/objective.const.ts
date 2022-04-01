import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { VowelObjective } from '@app/classes/objectives/objective-classes/vowel-objective';

export const LIST_OF_ALL_OBJECTIVES: AbstractObjective[] = [new VowelObjective()];

export const NUMBER_OF_OBJECTIVES_IN_GAME = 4;

export const OBJECTIVE_COMPLETE_MESSAGE = (name: string, bonusPoints: number) => ` complété l'objectif ${name} pour ${bonusPoints} points`;
