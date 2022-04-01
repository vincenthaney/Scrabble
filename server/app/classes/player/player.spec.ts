/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import Game from '@app/classes/game/game';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { GameObjectives } from '@app/classes/objectives/objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import {
    generateGameObjectives,
    generateResetableTestObjective,
    generateTestObjective,
} from '@app/constants/services-constants/objectives-test.const';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { assert } from 'console';
import * as sinon from 'sinon';
import { stub } from 'sinon';
import Player from './player';
chai.use(spies);

const ID = 'id';
const DEFAULT_NAME = 'player';

describe('Player', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(ID, DEFAULT_NAME);
        player.tiles = [
            { value: 1, letter: 'A' },
            { value: 4, letter: 'B' },
            { value: 2, letter: 'A' },
            { value: 4, letter: 'D' },
        ];
    });

    afterEach(() => {
        chai.spy.restore();
        sinon.restore();
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(player).to.exist;
    });

    it('getTileRackPoints should return the sum of tile values', () => {
        const expected = 11;
        expect(player.getTileRackPoints()).to.equal(expected);
    });

    it('hasTilesLeft should true if there are tiles left', () => {
        const expected = true;
        expect(player.hasTilesLeft()).to.equal(expected);
    });

    it('hasTilesLeft should false if there are tiles left', () => {
        player.tiles = [];
        const expected = false;
        expect(player.hasTilesLeft()).to.equal(expected);
    });

    it('endGameMessage should call tilesToString and return the correct message', () => {
        const tilesToStringStub = stub(player, 'tilesToString').returns('aaaa');
        expect(player.endGameMessage()).to.equal(`${player.name} : aaaa`);
        assert(tilesToStringStub.calledOnce);
    });

    it('tilesToString should return the string of the tiles', () => {
        expect(player.tilesToString()).to.equal('abad');
    });

    it('getObjectives should return player objectives as array', () => {
        player['objectives'] = new Set([generateTestObjective(1)]);
        const expected: AbstractObjective[] = [...player['objectives'].values()];
        const actual: AbstractObjective[] = player.getObjectives();
        expect(actual).to.deep.equal(expected);
    });

    it('initializeObjectives should set player objectives', async () => {
        const objectives: GameObjectives = generateGameObjectives();
        player['objectives'] = undefined as unknown as Set<AbstractObjective>;
        player.initializeObjectives(objectives.publicObjectives, objectives.player1Objective);
        expect(player['objectives']).to.deep.equal(objectives.publicObjectives.add(objectives.player1Objective));
    });

    describe('resetObjectivesProgression', () => {
        const initialProgress = 1;
        let objective: AbstractObjective;

        beforeEach(() => {
            objective = generateResetableTestObjective(1);

            player['objectives'] = new Set([objective]);
            objective.progress = initialProgress;
        });

        it('should not reset objective if it is completed', () => {
            chai.spy.on(objective, 'isCompleted', () => true);

            player.resetObjectivesProgression();

            expect(objective.progress).to.equal(initialProgress);
        });

        it('should not reset objective if it is not resetable', () => {
            objective = generateTestObjective(1);
            player['objectives'] = new Set([objective]);
            objective.progress = initialProgress;

            chai.spy.on(objective, 'isCompleted', () => false);
            expect(objective.shouldResetOnInvalidWord).to.be.false;

            player.resetObjectivesProgression();
            expect(objective.progress).to.equal(initialProgress);
        });

        it('should reset objective if conditions are met', () => {
            chai.spy.on(objective, 'isCompleted', () => false);
            expect(objective.shouldResetOnInvalidWord).to.be.true;

            player.resetObjectivesProgression();

            expect(objective.progress).to.equal(0);
        });
    });

    it('updateObjectives should call objective service to update objectives', async () => {
        const serviceSpy = chai.spy.on(player['objectiveService'], 'validatePlayerObjectives', () => {});
        const validationParameters: ObjectiveValidationParameters = { game: new Game() } as unknown as ObjectiveValidationParameters;
        player.updateObjectives(validationParameters);
        expect(serviceSpy).to.have.been.called.with(player, validationParameters.game, validationParameters);
    });
});
