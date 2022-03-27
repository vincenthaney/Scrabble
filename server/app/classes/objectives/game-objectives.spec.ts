/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { generateGameObjectives } from '@app/constants/objectives-test.const';
import { expect } from 'chai';
import { AbstractObjective } from './abstract-objective';
import { GameObjectives } from './game-objectives';

describe('Game Objectives', () => {
    let gameObjectives: GameObjectives;
    let publicObjectives: Set<AbstractObjective>;
    let player1Objective: AbstractObjective;
    let player2Objective: AbstractObjective;

    beforeEach(() => {
        gameObjectives = generateGameObjectives();
        publicObjectives = gameObjectives.publicObjectives;
        player1Objective = gameObjectives.player1Objective;
        player2Objective = gameObjectives.player2Objective;
    });

    it('getAllObjectives should return all of the game objectives', () => {
        const expectedSet = new Set(publicObjectives);
        expectedSet.add(player1Objective);
        expectedSet.add(player2Objective);

        expect(gameObjectives.getAllObjectives()).to.deep.equal(expectedSet);
    });
});
