/* eslint-disable @typescript-eslint/no-magic-numbers */
import Game from '@app/classes/game/game';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { GameObjectives } from '@app/classes/objectives/game-objectives';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import { WordPlacement } from '@app/classes/word-finding';

export const TEST_OBJECTIVE_MAX_PROGRESS = 3;

export const EMPTY_VALIDATION_PARAMETERS: ValidationParameters = {
    game: undefined as unknown as Game,
    wordPlacement: undefined as unknown as WordPlacement,
    scoredPoints: 0,
    createdWords: [],
};

export class TestObjective extends AbstractObjective {
    constructor(name: string, maxProgress: number) {
        super(name, 0, 0, maxProgress);
    }
    isValid(validationParameters: ValidationParameters): boolean {
        return validationParameters === undefined;
    }
}

export const generateTestObjective = (index: number) => {
    return new TestObjective(String(index), TEST_OBJECTIVE_MAX_PROGRESS);
};

export const generateGameObjectives = () => {
    const publicObjectives = new Set([generateTestObjective(1), generateTestObjective(2)]);
    const player1Objective = generateTestObjective(3);
    const player2Objective = generateTestObjective(4);

    return new GameObjectives(publicObjectives, player1Objective, player2Objective);
};
