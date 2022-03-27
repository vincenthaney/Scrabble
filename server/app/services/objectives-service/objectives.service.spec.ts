/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { GameObjectives } from '@app/classes/objectives/game-objectives';
import { EMPTY_VALIDATION_PARAMETERS, generateGameObjectives } from '@app/constants/objectives-test.const';
import * as chai from 'chai';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Container } from 'typedi';
import ObjectivesService from './objectives.service';

describe('ObjectiveService', () => {
    let service: ObjectivesService;

    beforeEach(() => {
        service = Container.get(ObjectivesService);
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    it('createObjectivesForGame should return new GameObjectives', () => {
        expect(service.createObjectivesForGame()).to.exist;
    });

    it('validateGameObjectives should call isValid on every objective', () => {
        const gameObjectives: GameObjectives = generateGameObjectives();
        chai.spy.on(gameObjectives, 'getAllObjectives', () => {
            const obj = [...gameObjectives.publicObjectives.values()];
            obj.push(gameObjectives.player1Objective);
            obj.push(gameObjectives.player2Objective);
            return obj;
        });

        const isValidSpies: unknown[] = [];
        gameObjectives.getAllObjectives().forEach((obj) => {
            const isValidSpy = chai.spy.on(obj, 'isValid');
            isValidSpies.push(isValidSpy);
        });

        service.validateGameObjectives(gameObjectives, EMPTY_VALIDATION_PARAMETERS);
        isValidSpies.forEach((spy) => {
            expect(spy).to.have.been.called.with(EMPTY_VALIDATION_PARAMETERS);
        });
    });
});
