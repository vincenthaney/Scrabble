/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { AbstractObjective } from './abstract-objective';
import { GameObjectives } from './game-objectives';
import { ValidationParameters } from './validation-parameters';

// const TEST_OBJECTIVE_MAX_PROGRESS = 3;

class TestObjective extends AbstractObjective {
    constructor(name: string, maxProgress: number) {
        super(name, 0, 0, maxProgress);
    }
    isValid(validationParameters: ValidationParameters): boolean {
        return validationParameters === undefined;
    }
}

const generateTestObjective = (index: number) => {
    // eslint-disable-next-line no-unused-vars
    index++;
    return undefined as unknown as TestObjective;
};

describe.only('Game Objectives', () => {
    let gameObjectives: GameObjectives;
    let publicObjectives: Set<AbstractObjective>;
    let player1Objective: AbstractObjective;
    let player2Objective: AbstractObjective;

    beforeEach(() => {
        publicObjectives = new Set([generateTestObjective(1), generateTestObjective(2)]);
        player1Objective = generateTestObjective(3);
        player2Objective = generateTestObjective(4);

        gameObjectives = new GameObjectives(publicObjectives, player1Objective, player2Objective);
    });

    it('getAllObjectives should return all of the game objectives', () => {
        const expectedSet = new Set(publicObjectives);
        expectedSet.add(player1Objective);
        expectedSet.add(player2Objective);

        expect(gameObjectives.getAllObjectives()).to.deep.equal(expectedSet);
    });
});
